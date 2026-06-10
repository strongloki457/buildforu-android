import { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { AuthContext, PaginationQuery } from "../types/api";
import { AppError, assertFound } from "../utils/errors";
import { generateTemporaryPassword, hashPassword } from "../utils/password";
import { getPagination, toPaginatedResult } from "../utils/pagination";
import type { CreateWorkerInput, UpdateWorkerInput } from "../validators/workers.validators";
import { ensureProjectsBelongToCompany } from "./companyScope.service";

const workerInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  projects: {
    include: {
      project: true
    }
  }
} as const;

function normalizeEmail(email: string | null | undefined) {
  const normalized = String(email ?? "").trim().toLowerCase();
  return normalized || null;
}

async function assertEmployeeEmailAvailable(email: string, companyId: string, workerId?: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      companyId: true,
      workerId: true
    }
  });

  if (!existingUser || (workerId && existingUser.companyId === companyId && existingUser.workerId === workerId)) {
    return;
  }

  throw new AppError(409, "An account with this email already exists.", "EMAIL_IN_USE");
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

  return toPaginatedResult(workers, total, query);
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
  let existingUserToLink: { id: string } | null = null;

  if (input.createLogin) {
    if (!email) {
      throw new AppError(400, "Email is required to create employee login.", "EMAIL_REQUIRED");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, companyId: true, workerId: true }
    });

    if (existingUser) {
      if (existingUser.companyId !== currentUser.companyId) {
        throw new AppError(409, "An account with this email already exists.", "EMAIL_IN_USE");
      }
      if (existingUser.workerId) {
        throw new AppError(409, "This user is already linked to another worker.", "USER_ALREADY_LINKED");
      }
      existingUserToLink = existingUser;
    } else {
      temporaryPassword = generateTemporaryPassword();
      temporaryPasswordHash = await hashPassword(temporaryPassword);
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

    if (input.createLogin && email) {
      if (existingUserToLink) {
        await tx.user.update({
          where: { id: existingUserToLink.id },
          data: { workerId: worker.id }
        });
      } else if (temporaryPasswordHash) {
        await tx.user.create({
          data: {
            name: worker.name,
            email,
            passwordHash: temporaryPasswordHash,
            role: Role.EMPLOYEE,
            companyId: currentUser.companyId,
            workerId: worker.id
          }
        });
      }
    }

    return worker;
  }, { isolationLevel: "Serializable" });

  const worker = await prisma.worker.findUniqueOrThrow({
    where: { id: createdWorker.id },
    include: workerInclude
  });

  return {
    worker,
    temporaryPassword
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

  if (input.createLogin) {
    const email = normalizeEmail(input.email) || normalizeEmail(scopedWorker.email);

    if (!email) {
      throw new AppError(400, "Email is required to create employee login.", "EMAIL_REQUIRED");
    }

    await assertEmployeeEmailAvailable(email, currentUser.companyId, workerId);
    temporaryPassword = generateTemporaryPassword();
    temporaryPasswordHash = await hashPassword(temporaryPassword);
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

    if (input.name !== undefined || input.email !== undefined) {
      const userData: Prisma.UserUpdateManyMutationInput = {};

      if (input.name !== undefined) userData.name = input.name;
      const normalizedInputEmail = normalizeEmail(input.email);
      if (normalizedInputEmail) userData.email = normalizedInputEmail;

      if (Object.keys(userData).length) {
        await tx.user.updateMany({
          where: {
            workerId,
            companyId: currentUser.companyId
          },
          data: userData
        });
      }
    }

    if (projectIds !== undefined) {
      await tx.workerProject.deleteMany({
        where: { workerId }
      });

      if (projectIds.length) {
        await tx.workerProject.createMany({
          data: projectIds.map((projectId) => ({ workerId, projectId })),
          skipDuplicates: true
        });
      }
    }

    if (input.createLogin && temporaryPasswordHash) {
      const email = normalizeEmail(input.email) || normalizeEmail(scopedWorker.email);
      const existingUser = await tx.user.findFirst({
        where: {
          workerId,
          companyId: currentUser.companyId
        },
        select: { id: true }
      });

      if (!existingUser) {
        await tx.user.create({
          data: {
            name: input.name || scopedWorker.name,
            email: email!,
            passwordHash: temporaryPasswordHash,
            role: Role.EMPLOYEE,
            companyId: currentUser.companyId,
            workerId
          }
        });
      } else {
        temporaryPassword = null;
      }
    }
  });

  const worker = await prisma.worker.findUniqueOrThrow({
    where: { id: workerId },
    include: workerInclude
  });

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

  await prisma.$transaction([
    prisma.user.deleteMany({
      where: {
        workerId,
        companyId: currentUser.companyId
      }
    }),
    prisma.workerProject.deleteMany({
      where: { workerId }
    }),
    prisma.worker.update({
      where: { id: workerId },
      data: {
        deletedAt: new Date(),
        email: null
      }
    })
  ]);
}
