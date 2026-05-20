import { prisma } from "../config/prisma";
import { AppError, assertFound } from "../utils/errors";

export function normalizeOptionalId(value: string | null | undefined) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export async function requireCompanyWorker(workerId: string, companyId: string): Promise<void> {
  const worker = await prisma.worker.findFirst({
    where: { id: workerId, companyId, deletedAt: null },
    select: { id: true }
  });

  assertFound(worker, "Worker was not found in this company.");
}

export async function requireCompanyProject(projectId: string, companyId: string): Promise<void> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, companyId, deletedAt: null },
    select: { id: true }
  });

  assertFound(project, "Project was not found in this company.");
}

export async function ensureWorkersBelongToCompany(workerIds: string[], companyId: string) {
  const uniqueWorkerIds = Array.from(new Set(workerIds.filter(Boolean)));

  if (!uniqueWorkerIds.length) {
    return [];
  }

  const workers = await prisma.worker.findMany({
    where: {
      id: { in: uniqueWorkerIds },
      companyId,
      deletedAt: null
    },
    select: { id: true }
  });

  if (workers.length !== uniqueWorkerIds.length) {
    throw new AppError(400, "One or more workers do not belong to this company.", "INVALID_WORKERS");
  }

  return uniqueWorkerIds;
}

export async function ensureProjectsBelongToCompany(projectIds: string[], companyId: string) {
  const uniqueProjectIds = Array.from(new Set(projectIds.filter(Boolean)));

  if (!uniqueProjectIds.length) {
    return [];
  }

  const projects = await prisma.project.findMany({
    where: {
      id: { in: uniqueProjectIds },
      companyId,
      deletedAt: null
    },
    select: { id: true }
  });

  if (projects.length !== uniqueProjectIds.length) {
    throw new AppError(400, "One or more projects do not belong to this company.", "INVALID_PROJECTS");
  }

  return uniqueProjectIds;
}
