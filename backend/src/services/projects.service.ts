import { Prisma, ProjectStatus, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { AuthContext } from "../types/api";
import { AppError, assertFound } from "../utils/errors";
import { getPagination, toPaginatedResult } from "../utils/pagination";
import type {
  AssignProjectWorkersInput,
  CreateProjectInput,
  UpdateProjectInput
} from "../validators/projects.validators";
import { ensureWorkersBelongToCompany } from "./companyScope.service";

const projectInclude = {
  workers: {
    include: {
      worker: true
    }
  }
} as const;

type ProjectsQuery = {
  page: number;
  limit: number;
  status?: ProjectStatus;
};

function getProjectWhere(currentUser: AuthContext, query: ProjectsQuery): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {
    companyId: currentUser.companyId,
    deletedAt: null
  };

  if (query.status) {
    where.status = query.status;
  }

  if (currentUser.role === Role.EMPLOYEE) {
    if (!currentUser.workerId) {
      throw new AppError(403, "This account is not linked to a worker profile.", "WORKER_PROFILE_REQUIRED");
    }

    where.workers = {
      some: {
        workerId: currentUser.workerId
      }
    };
  }

  return where;
}

export async function listProjects(currentUser: AuthContext, query: ProjectsQuery) {
  const pagination = getPagination(query);
  const where = getProjectWhere(currentUser, query);

  const [total, projects] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: projectInclude,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take
    })
  ]);

  return toPaginatedResult(projects, total, query);
}

export async function createProject(currentUser: AuthContext, input: CreateProjectInput) {
  const workerIds = await ensureWorkersBelongToCompany(input.workerIds, currentUser.companyId);

  const project = await prisma.project.create({
    data: {
      name: input.name,
      status: input.status,
      note: input.note || null,
      companyId: currentUser.companyId,
      workers: workerIds.length
        ? {
            createMany: {
              data: workerIds.map((workerId) => ({ workerId })),
              skipDuplicates: true
            }
          }
        : undefined
    },
    include: projectInclude
  });

  return project;
}

export async function updateProject(currentUser: AuthContext, projectId: string, input: UpdateProjectInput) {
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      companyId: currentUser.companyId,
      deletedAt: null
    },
    select: { id: true }
  });

  assertFound(existingProject, "Project was not found in this company.");

  const workerIds =
    input.workerIds === undefined ? undefined : await ensureWorkersBelongToCompany(input.workerIds, currentUser.companyId);

  await prisma.$transaction(async (tx) => {
    const data: Prisma.ProjectUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.status !== undefined) data.status = input.status;
    if (input.note !== undefined) data.note = input.note || null;

    await tx.project.update({
      where: { id: projectId },
      data
    });

    if (workerIds !== undefined) {
      await tx.workerProject.deleteMany({
        where: { projectId }
      });

      if (workerIds.length) {
        await tx.workerProject.createMany({
          data: workerIds.map((workerId) => ({ workerId, projectId })),
          skipDuplicates: true
        });
      }
    }
  });

  return prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: projectInclude
  });
}

export async function deleteProject(currentUser: AuthContext, projectId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      companyId: currentUser.companyId,
      deletedAt: null
    },
    select: { id: true }
  });

  assertFound(project, "Project was not found in this company.");

  await prisma.$transaction([
    prisma.workerProject.deleteMany({
      where: { projectId }
    }),
    prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() }
    })
  ]);
}

export async function assignProjectWorkers(
  currentUser: AuthContext,
  projectId: string,
  input: AssignProjectWorkersInput
) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      companyId: currentUser.companyId,
      deletedAt: null
    },
    select: { id: true }
  });

  assertFound(project, "Project was not found in this company.");

  const workerIds = await ensureWorkersBelongToCompany(input.workerIds, currentUser.companyId);

  await prisma.$transaction(async (tx) => {
    await tx.workerProject.deleteMany({
      where: { projectId }
    });

    if (workerIds.length) {
      await tx.workerProject.createMany({
        data: workerIds.map((workerId) => ({ workerId, projectId })),
        skipDuplicates: true
      });
    }
  });

  return prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: projectInclude
  });
}
