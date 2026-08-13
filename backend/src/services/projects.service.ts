import { MaterialRequestStatus, Prisma, ProjectStatus, Role } from "@prisma/client";
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
      worker: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          notes: true,
          companyId: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true
        }
      }
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

  const visibleProjects =
    currentUser.role === Role.EMPLOYEE ? projects.map(({ budget, ...rest }) => rest) : projects;

  return toPaginatedResult(visibleProjects, total, query);
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

export async function updateProjectBudget(currentUser: AuthContext, projectId: string, budget: number | null) {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, companyId: currentUser.companyId, deletedAt: null },
    select: { id: true }
  });

  assertFound(existingProject, "Project was not found in this company.");

  await prisma.project.update({
    where: { id: projectId },
    data: { budget }
  });

  return prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: projectInclude
  });
}

export async function getProjectCosting(currentUser: AuthContext, projectId: string) {
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, companyId: currentUser.companyId, deletedAt: null },
    select: { id: true, budget: true }
  });

  const project = assertFound(existingProject, "Project was not found in this company.");

  const assignments = await prisma.workerProject.findMany({
    where: { projectId },
    select: {
      createdAt: true,
      worker: {
        select: {
          id: true,
          name: true,
          hourlyRate: true,
          _count: { select: { projects: { where: { project: { deletedAt: null } } } } }
        }
      }
    }
  });

  const workerIds = assignments.map(({ worker }) => worker.id);

  const attendanceSessions = workerIds.length
    ? await prisma.attendance.findMany({
        where: { workerId: { in: workerIds }, endTime: { not: null } },
        select: { workerId: true, startTime: true, endTime: true }
      })
    : [];

  const sessionsByWorker = new Map<string, typeof attendanceSessions>();
  for (const session of attendanceSessions) {
    const list = sessionsByWorker.get(session.workerId);
    if (list) list.push(session);
    else sessionsByWorker.set(session.workerId, [session]);
  }

  let laborCost = 0;
  let laborHours = 0;
  const multiProjectWorkers: string[] = [];

  for (const assignment of assignments) {
    const { worker } = assignment;
    // A worker's logged hours aren't tagged with a project, so sessions predating this
    // assignment are excluded and, for workers on multiple concurrent projects, the hours
    // are split evenly across those projects instead of being counted in full on each.
    const concurrentProjects = worker._count.projects || 1;
    const sessions = sessionsByWorker.get(worker.id) ?? [];

    const hours = sessions.reduce((sum, session) => {
      if (session.startTime < assignment.createdAt) return sum;
      const ms = (session.endTime as Date).getTime() - session.startTime.getTime();
      return sum + Math.max(ms, 0) / (1000 * 60 * 60);
    }, 0);

    const shareHours = hours / concurrentProjects;
    laborHours += shareHours;
    laborCost += shareHours * (worker.hourlyRate ?? 0);

    if (concurrentProjects > 1) multiProjectWorkers.push(worker.name);
  }

  const materialsAgg = await prisma.materialRequest.aggregate({
    where: { projectId, status: MaterialRequestStatus.PURCHASED },
    _sum: { totalCost: true }
  });
  const materialsCost = materialsAgg._sum.totalCost ?? 0;

  const expensesAgg = await prisma.expense.aggregate({
    where: { projectId },
    _sum: { amount: true }
  });
  const expensesCost = expensesAgg._sum.amount ?? 0;

  const totalCost = laborCost + materialsCost + expensesCost;
  const budget = project.budget;
  const variance = budget !== null ? budget - totalCost : null;
  const variancePct = budget !== null && budget > 0 ? (variance! / budget) * 100 : null;

  return {
    budget,
    laborCost,
    laborHours,
    materialsCost,
    expensesCost,
    totalCost,
    variance,
    variancePct,
    multiProjectWorkers
  };
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
