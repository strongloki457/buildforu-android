import { MaterialRequestStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { AuthContext } from "../types/api";
import { AppError, assertFound } from "../utils/errors";
import { getPagination, toPaginatedResult } from "../utils/pagination";
import type { CreateMaterialRequestInput, MaterialsQuery } from "../validators/materials.validators";
import { normalizeOptionalId, requireCompanyProject, requireCompanyWorker } from "./companyScope.service";

const materialInclude = {
  requesterWorker: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  project: {
    select: {
      id: true,
      name: true,
      status: true
    }
  }
} as const;

function getMaterialWhere(currentUser: AuthContext, query: MaterialsQuery): Prisma.MaterialRequestWhereInput {
  const where: Prisma.MaterialRequestWhereInput = {
    companyId: currentUser.companyId
  };

  if (query.status) {
    where.status = query.status;
  }

  if (currentUser.role === Role.EMPLOYEE) {
    if (!currentUser.workerId) {
      throw new AppError(403, "This account is not linked to a worker profile.", "WORKER_PROFILE_REQUIRED");
    }

    where.requesterWorkerId = currentUser.workerId;
  }

  return where;
}

export async function listMaterialRequests(currentUser: AuthContext, query: MaterialsQuery) {
  const pagination = getPagination(query);
  const where = getMaterialWhere(currentUser, query);

  const [total, materialRequests] = await prisma.$transaction([
    prisma.materialRequest.count({ where }),
    prisma.materialRequest.findMany({
      where,
      include: materialInclude,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take
    })
  ]);

  return toPaginatedResult(materialRequests, total, query);
}

function resolveRequesterWorkerId(currentUser: AuthContext, input: CreateMaterialRequestInput) {
  if (currentUser.role === Role.EMPLOYEE) {
    if (!currentUser.workerId) {
      throw new AppError(403, "This account is not linked to a worker profile.", "WORKER_PROFILE_REQUIRED");
    }

    return currentUser.workerId;
  }

  const requesterWorkerId = normalizeOptionalId(input.requesterWorkerId);

  if (!requesterWorkerId) {
    throw new AppError(400, "requesterWorkerId is required when an admin creates a material request.", "REQUESTER_REQUIRED");
  }

  return requesterWorkerId;
}

export async function createMaterialRequest(currentUser: AuthContext, input: CreateMaterialRequestInput) {
  const requesterWorkerId = resolveRequesterWorkerId(currentUser, input);
  const projectId = normalizeOptionalId(input.projectId);

  await requireCompanyWorker(requesterWorkerId, currentUser.companyId);

  if (projectId) {
    await requireCompanyProject(projectId, currentUser.companyId);
  }

  return prisma.materialRequest.create({
    data: {
      itemName: input.itemName,
      quantity: input.quantity || null,
      note: input.note || null,
      imageBase64: input.imageBase64 || null,
      status: MaterialRequestStatus.PENDING,
      companyId: currentUser.companyId,
      requesterWorkerId,
      projectId
    },
    include: materialInclude
  });
}

export async function updateMaterialRequestStatus(
  currentUser: AuthContext,
  requestId: string,
  status: MaterialRequestStatus
) {
  const request = await prisma.materialRequest.findFirst({
    where: {
      id: requestId,
      companyId: currentUser.companyId
    },
    select: { id: true }
  });

  assertFound(request, "Material request was not found in this company.");

  return prisma.materialRequest.update({
    where: { id: requestId },
    data: { status },
    include: materialInclude
  });
}

export async function deleteMaterialRequest(currentUser: AuthContext, requestId: string) {
  const request = await prisma.materialRequest.findFirst({
    where: {
      id: requestId,
      companyId: currentUser.companyId
    },
    select: {
      id: true,
      requesterWorkerId: true,
      status: true
    }
  });

  const scopedRequest = assertFound(request, "Material request was not found in this company.");

  if (currentUser.role === Role.EMPLOYEE) {
    if (!currentUser.workerId || scopedRequest.requesterWorkerId !== currentUser.workerId) {
      throw new AppError(403, "Employees can only delete their own material requests.", "MATERIAL_DELETE_FORBIDDEN");
    }

    if (scopedRequest.status !== MaterialRequestStatus.PENDING) {
      throw new AppError(409, "Only pending material requests can be deleted by employees.", "MATERIAL_NOT_PENDING");
    }
  }

  await prisma.materialRequest.delete({
    where: { id: requestId }
  });
}
