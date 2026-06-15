import { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { AuthContext, PaginationQuery } from "../types/api";
import { AppError, assertFound } from "../utils/errors";
import { generateTemporaryPassword, hashPassword } from "../utils/password";
import { getPagination, toPaginatedResult } from "../utils/pagination";
import type { CreateWorkerInput, UpdateWorkerInput } from "../validators/workers.validators";
import { ensureProjectsBelongToCompany } from "./companyScope.service";

const workerInclude = {
  userCompany: {
    select: {
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  },
  projects: {
    include: {
      project: true
    }
  }
} as const;

// Normalize worker output so consumers get `worker.user` like before
function normalizeWorker(worker: Awaited<ReturnType<typeof fetchWorker>>) {
  const { userCompany, ...rest } = worker;
  return {
    ...rest,
    user: userCompany
      ? {
          id: userCompany.user.id,
          name: userCompany.user.name,
          email: userCompany.user.email,
          role: userCompany.role
        }
      : null
  };
}

async function fetchWorker(id: string) {
  return prisma.worker.findUniqueOrThrow({
    where: { id },
    include: workerInclude
  });
}

function normalizeEmail(email: string | null | undefined) {
  const normalized = String(email ?? "").trim().toLowerCase();
  return normalized || null;
}

type EmailCheckResult =
  | { available: true }
  | { available: false; sameCompany: true; canSelfLink: false }
  | { available: false; sameCompany: true; canSelfLink: true; existingUserId: string }
  | { available: false; sameCompany: false; existingUserId: string; existingUserName: string };

async function checkEmailAvailability(email: string, companyId: string, excludeWorkerId?: string): Promise<EmailCheckResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      userCompanies: {
        where: { companyId },
        select: { id: true, role: true, workerId: true }
      }
    }
  });

  if (!existingUser) return { available: true };

  const membershipInThisCompany = existingUser.userCompanies[0];

  if (membershipInThisCompany) {
    // Already in this company — allow only if it's the same worker being updated
    if (excludeWorkerId && membershipInThisCompany.workerId === excludeWorkerId) {
      return { available: true };
    }
    // Allow admin to add themselves as a worker (self-link)
    if (membershipInThisCompany.role === Role.ADMIN && membershipInThisCompany.workerId === null) {
      return { available: false, sameCompany: true, canSelfLink: true, existingUserId: existingUser.id };
    }
    return { available: false, sameCompany: true, canSelfLink: false };
  }

  // Email exists but in a different company — can be linked
  return {
    available: false,
    sameCompany: false,
    existingUserId: existingUser.id,
    existingUserName: existingUser.name
  };
}

export async function listWorkers(currentUser: AuthContext, query: PaginationQuery) {
  const pagination = getPagination(query);
  const where: Prisma.WorkerWhereInput = {
    companyId: currentUser.companyId,
    deletedAt: null
  };

  const [total, workers] = await prisma.$transaction([
    prisma.worker.count({ where }),
    prisma.worker.findMany({
      where,
      include: workerInclude,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take
    })
  ]);

  return toPaginatedResult(workers.map(normalizeWorker), total, query);
}

const PLAN_WORKER_LIMITS: Record<string, number> = {
  starter: 5,
  pro: 25,
  enterprise: Infinity
};

export async function createWorker(currentUser: AuthContext, input: CreateWorkerInput) {
  const projectIds = await ensureProjectsBelongToCompany(input.projectIds, currentUser.companyId);
  const email = normalizeEmail(input.email);
  let temporaryPassword: string | null = null;
  let temporaryPasswordHash: string | null = null;
  let linkedUserId: string | null = null;
  let selfLinkUserId: string | null = null;

  if (input.createLogin) {
    if (input.linkExistingUserId) {
      // Verify the existing user exists and is not already in this company
      const existingUser = await prisma.user.findUnique({
        where: { id: input.linkExistingUserId },
        select: {
          id: true,
          userCompanies: {
            where: { companyId: currentUser.companyId },
            select: { id: true }
          }
        }
      });

      if (!existingUser) {
        throw new AppError(404, "User to link was not found.", "USER_NOT_FOUND");
      }

      if (existingUser.userCompanies.length > 0) {
        throw new AppError(409, "This user is already a member of this company.", "EMAIL_IN_USE");
      }

      linkedUserId = input.linkExistingUserId;
    } else {
      if (!email) {
        throw new AppError(400, "Email is required to create employee login.", "EMAIL_REQUIRED");
      }

      const check = await checkEmailAvailability(email, currentUser.companyId);

      if (!check.available) {
        if (check.sameCompany) {
          if (check.canSelfLink) {
            // Admin adding themselves as worker — will update their UserCompany.workerId
            selfLinkUserId = check.existingUserId;
          } else {
            throw new AppError(409, "An account with this email already exists.", "EMAIL_IN_USE");
          }
        } else {
          // Cross-company: return info so frontend can offer linking
          throw new AppError(409, "An account with this email already exists in another company.", "EMAIL_EXISTS_OTHER_COMPANY", {
            existingUserId: check.existingUserId,
            existingUserName: check.existingUserName
          });
        }
      } else {
        temporaryPassword = generateTemporaryPassword();
        temporaryPasswordHash = await hashPassword(temporaryPassword);
      }
    }
  }

  const createdWorker = await prisma.$transaction(async (tx) => {
    const company = await tx.company.findUnique({
      where: { id: currentUser.companyId },
      select: { plan: true }
    });
    const limit = PLAN_WORKER_LIMITS[company?.plan ?? "starter"] ?? 5;
    if (isFinite(limit)) {
      const count = await tx.worker.count({ where: { companyId: currentUser.companyId, deletedAt: null } });
      if (count >= limit) {
        throw new AppError(
          403,
          `Your ${company?.plan ?? "starter"} plan allows a maximum of ${limit} workers. Upgrade to add more.`,
          "WORKER_LIMIT_EXCEEDED"
        );
      }
    }

    const worker = await tx.worker.create({
      data: {
        name: input.name,
        email,
        phone: input.phone || null,
        notes: input.notes || null,
        companyId: currentUser.companyId,
        projects: projectIds.length
          ? {
              createMany: {
                data: projectIds.map((projectId) => ({ projectId })),
                skipDuplicates: true
              }
            }
          : undefined
      }
    });

    if (input.createLogin) {
      if (selfLinkUserId) {
        // Admin adding themselves as worker — update their existing UserCompany.workerId
        await tx.userCompany.update({
          where: { userId_companyId: { userId: selfLinkUserId, companyId: currentUser.companyId } },
          data: { workerId: worker.id }
        });
      } else if (linkedUserId) {
        // Link existing account from another company to this worker
        await tx.userCompany.create({
          data: {
            userId: linkedUserId,
            companyId: currentUser.companyId,
            role: Role.EMPLOYEE,
            workerId: worker.id
          }
        });
      } else if (email && temporaryPasswordHash) {
        // Create new account
        const newUser = await tx.user.create({
          data: {
            name: worker.name,
            email,
            passwordHash: temporaryPasswordHash
          }
        });

        await tx.userCompany.create({
          data: {
            userId: newUser.id,
            companyId: currentUser.companyId,
            role: Role.EMPLOYEE,
            workerId: worker.id
          }
        });
      }
    }

    return worker;
  }, { isolationLevel: "Serializable" });

  const worker = normalizeWorker(await fetchWorker(createdWorker.id));

  return {
    worker,
    temporaryPassword,
    selfLinked: !!selfLinkUserId
  };
}

export async function updateWorker(currentUser: AuthContext, workerId: string, input: UpdateWorkerInput) {
  const existingWorker = await prisma.worker.findFirst({
    where: {
      id: workerId,
      companyId: currentUser.companyId,
      deletedAt: null
    },
    select: {
      id: true,
      email: true,
      name: true
    }
  });

  const scopedWorker = assertFound(existingWorker, "Worker was not found in this company.");

  const projectIds =
    input.projectIds === undefined ? undefined : await ensureProjectsBelongToCompany(input.projectIds, currentUser.companyId);
  let temporaryPassword: string | null = null;
  let temporaryPasswordHash: string | null = null;
  let linkedUserId: string | null = null;

  if (input.createLogin) {
    if (input.linkExistingUserId) {
      const existingUser = await prisma.user.findUnique({
        where: { id: input.linkExistingUserId },
        select: {
          id: true,
          userCompanies: {
            where: { companyId: currentUser.companyId },
            select: { id: true }
          }
        }
      });

      if (!existingUser) {
        throw new AppError(404, "User to link was not found.", "USER_NOT_FOUND");
      }

      if (existingUser.userCompanies.length > 0) {
        throw new AppError(409, "This user is already a member of this company.", "EMAIL_IN_USE");
      }

      linkedUserId = input.linkExistingUserId;
    } else {
      const email = normalizeEmail(input.email) || normalizeEmail(scopedWorker.email);

      if (!email) {
        throw new AppError(400, "Email is required to create employee login.", "EMAIL_REQUIRED");
      }

      const check = await checkEmailAvailability(email, currentUser.companyId, workerId);

      if (!check.available) {
        if (check.sameCompany) {
          throw new AppError(409, "An account with this email already exists.", "EMAIL_IN_USE");
        }
        throw new AppError(409, "An account with this email already exists in another company.", "EMAIL_EXISTS_OTHER_COMPANY", {
          existingUserId: check.existingUserId,
          existingUserName: check.existingUserName
        });
      }

      temporaryPassword = generateTemporaryPassword();
      temporaryPasswordHash = await hashPassword(temporaryPassword);
    }
  }

  await prisma.$transaction(async (tx) => {
    const data: Prisma.WorkerUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = normalizeEmail(input.email);
    if (input.phone !== undefined) data.phone = input.phone || null;
    if (input.notes !== undefined) data.notes = input.notes || null;

    await tx.worker.update({
      where: { id: workerId },
      data
    });

    // Sync name/email on linked user account within this company
    if (input.name !== undefined || input.email !== undefined) {
      const userData: Prisma.UserUpdateInput = {};

      if (input.name !== undefined) userData.name = input.name;

      const normalizedInputEmail = normalizeEmail(input.email);
      if (normalizedInputEmail) {
        const emailConflict = await tx.userCompany.findFirst({
          where: {
            companyId: currentUser.companyId,
            NOT: [{ workerId }],
            user: { email: normalizedInputEmail }
          },
          select: { id: true }
        });

        if (emailConflict) {
          throw new AppError(409, "An account with this email already exists.", "EMAIL_IN_USE");
        }

        userData.email = normalizedInputEmail;
      }

      if (Object.keys(userData).length) {
        const membership = await tx.userCompany.findFirst({
          where: { workerId, companyId: currentUser.companyId },
          select: { userId: true }
        });

        if (membership) {
          await tx.user.update({
            where: { id: membership.userId },
            data: userData
          });
        }
      }
    }

    if (projectIds !== undefined) {
      await tx.workerProject.deleteMany({ where: { workerId } });

      if (projectIds.length) {
        await tx.workerProject.createMany({
          data: projectIds.map((projectId) => ({ workerId, projectId })),
          skipDuplicates: true
        });
      }
    }

    if (input.createLogin) {
      const existingMembership = await tx.userCompany.findFirst({
        where: { workerId, companyId: currentUser.companyId },
        select: { id: true }
      });

      if (!existingMembership) {
        if (linkedUserId) {
          await tx.userCompany.create({
            data: {
              userId: linkedUserId,
              companyId: currentUser.companyId,
              role: Role.EMPLOYEE,
              workerId
            }
          });
        } else if (temporaryPasswordHash) {
          const email = normalizeEmail(input.email) || normalizeEmail(scopedWorker.email);
          const newUser = await tx.user.create({
            data: {
              name: input.name || scopedWorker.name,
              email: email!,
              passwordHash: temporaryPasswordHash
            }
          });

          await tx.userCompany.create({
            data: {
              userId: newUser.id,
              companyId: currentUser.companyId,
              role: Role.EMPLOYEE,
              workerId
            }
          });
        }
      } else {
        temporaryPassword = null;
      }
    }
  });

  const worker = normalizeWorker(await fetchWorker(workerId));

  return {
    worker,
    temporaryPassword
  };
}

export async function deleteWorker(currentUser: AuthContext, workerId: string) {
  const worker = await prisma.worker.findFirst({
    where: {
      id: workerId,
      companyId: currentUser.companyId,
      deletedAt: null
    },
    select: { id: true }
  });

  assertFound(worker, "Worker was not found in this company.");

  await prisma.$transaction(async (tx) => {
    // Remove membership (but keep the User — they may belong to other companies)
    const membership = await tx.userCompany.findFirst({
      where: { workerId, companyId: currentUser.companyId },
      select: { id: true, userId: true }
    });

    if (membership) {
      await tx.userCompany.delete({ where: { id: membership.id } });

      // If the user no longer belongs to any company, delete them too
      const remainingMemberships = await tx.userCompany.count({
        where: { userId: membership.userId }
      });

      if (remainingMemberships === 0) {
        await tx.user.delete({ where: { id: membership.userId } });
      }
    }

    await tx.workerProject.deleteMany({ where: { workerId } });

    await tx.worker.update({
      where: { id: workerId },
      data: { deletedAt: new Date(), email: null }
    });
  });
}
