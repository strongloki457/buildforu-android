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

export async function createWorker(currentUser: AuthContext, input: CreateWorkerInput) {
  const projectIds = await ensureProjectsBelongToCompany(input.projectIds, currentUser.companyId);
  const email = input.email || null;
  let temporaryPassword: string | null = null;
  let temporaryPasswordHash: string | null = null;

  if (input.createLogin) {
    if (!email) {
      throw new AppError(400, "Email is required to create employee login.", "EMAIL_REQUIRED");
    }

    temporaryPassword = generateTemporaryPassword();
    temporaryPasswordHash = await hashPassword(temporaryPassword);
  }

  const createdWorker = await prisma.$transaction(async (tx) => {
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

    if (input.createLogin && email && temporaryPasswordHash) {
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

    return worker;
  });

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
    const email = input.email || scopedWorker.email;

    if (!email) {
      throw new AppError(400, "Email is required to create employee login.", "EMAIL_REQUIRED");
    }

    temporaryPassword = generateTemporaryPassword();
    temporaryPasswordHash = await hashPassword(temporaryPassword);
  }

  await prisma.$transaction(async (tx) => {
    const data: Prisma.WorkerUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email || null;
    if (input.phone !== undefined) data.phone = input.phone || null;
    if (input.notes !== undefined) data.notes = input.notes || null;

    await tx.worker.update({
      where: { id: workerId },
      data
    });

    if (input.name !== undefined || input.email !== undefined) {
      const userData: Prisma.UserUpdateManyMutationInput = {};

      if (input.name !== undefined) userData.name = input.name;
      if (input.email) userData.email = input.email;

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
      const email = input.email || scopedWorker.email;
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
