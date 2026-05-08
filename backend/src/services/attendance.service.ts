import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { AuthContext, PaginationQuery } from "../types/api";
import { AppError } from "../utils/errors";
import { getPagination, toPaginatedResult } from "../utils/pagination";
import type { AttendanceLocationInput } from "../validators/attendance.validators";
import { requireCompanyWorker } from "./companyScope.service";

const attendanceInclude = {
  worker: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} as const;

function requireEmployeeWorker(currentUser: AuthContext) {
  if (currentUser.role !== Role.EMPLOYEE || !currentUser.workerId) {
    throw new AppError(403, "Employee worker profile is required for attendance.", "WORKER_PROFILE_REQUIRED");
  }

  return currentUser.workerId;
}

export async function startAttendance(currentUser: AuthContext, input: AttendanceLocationInput) {
  const workerId = requireEmployeeWorker(currentUser);
  await requireCompanyWorker(workerId, currentUser.companyId);

  const activeSession = await prisma.attendance.findFirst({
    where: {
      companyId: currentUser.companyId,
      workerId,
      endTime: null
    },
    select: { id: true }
  });

  if (activeSession) {
    throw new AppError(409, "This worker already has an active attendance session.", "ATTENDANCE_ALREADY_ACTIVE");
  }

  return prisma.attendance.create({
    data: {
      companyId: currentUser.companyId,
      workerId,
      startTime: new Date(),
      startLat: input.lat,
      startLng: input.lng
    },
    include: attendanceInclude
  });
}

export async function endAttendance(currentUser: AuthContext, input: AttendanceLocationInput) {
  const workerId = requireEmployeeWorker(currentUser);

  const activeSession = await prisma.attendance.findFirst({
    where: {
      companyId: currentUser.companyId,
      workerId,
      endTime: null
    },
    orderBy: { startTime: "desc" },
    select: { id: true }
  });

  if (!activeSession) {
    throw new AppError(404, "No active attendance session was found.", "ATTENDANCE_NOT_ACTIVE");
  }

  return prisma.attendance.update({
    where: { id: activeSession.id },
    data: {
      endTime: new Date(),
      endLat: input.lat,
      endLng: input.lng
    },
    include: attendanceInclude
  });
}

export async function listAttendance(currentUser: AuthContext, query: PaginationQuery) {
  const pagination = getPagination(query);
  const where =
    currentUser.role === Role.ADMIN
      ? { companyId: currentUser.companyId }
      : {
          companyId: currentUser.companyId,
          workerId: requireEmployeeWorker(currentUser)
        };

  const [total, attendance] = await prisma.$transaction([
    prisma.attendance.count({ where }),
    prisma.attendance.findMany({
      where,
      include: attendanceInclude,
      orderBy: { startTime: "desc" },
      skip: pagination.skip,
      take: pagination.take
    })
  ]);

  return toPaginatedResult(attendance, total, query);
}
