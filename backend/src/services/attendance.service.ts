import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { AuthContext, PaginationQuery } from "../types/api";
import { AppError, assertFound } from "../utils/errors";
import { getPagination, toPaginatedResult } from "../utils/pagination";
import type { AttendanceLocationInput, AttendanceLocationPointInput } from "../validators/attendance.validators";


const workerSelect = {
  select: { id: true, name: true, email: true }
} as const;

const lastLocationPointInclude = {
  locationPoints: {
    orderBy: { recordedAt: "desc" as const },
    take: 1,
    select: { id: true, latitude: true, longitude: true, accuracy: true, recordedAt: true }
  },
  _count: { select: { locationPoints: true } }
} as const;

const attendanceInclude = {
  worker: workerSelect,
  ...lastLocationPointInclude
} as const;

const attendanceListInclude = {
  worker: workerSelect,
  _count: { select: { locationPoints: true } }
} as const;

function requireEmployeeWorker(currentUser: AuthContext) {
  if (currentUser.role !== Role.EMPLOYEE || !currentUser.workerId) {
    throw new AppError(403, "Employee worker profile is required for attendance.", "WORKER_PROFILE_REQUIRED");
  }

  return currentUser.workerId;
}

export async function startAttendance(currentUser: AuthContext, input: AttendanceLocationInput) {
  const workerId = requireEmployeeWorker(currentUser);

  return prisma.$transaction(
    async (tx) => {
      const worker = await tx.worker.findFirst({
        where: { id: workerId, companyId: currentUser.companyId, deletedAt: null },
        select: { id: true }
      });

      if (!worker) {
        throw new AppError(403, "Worker was not found in this company.", "WORKER_NOT_FOUND");
      }

      const activeSession = await tx.attendance.findFirst({
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

      const now = new Date();

      return tx.attendance.create({
        data: {
          companyId: currentUser.companyId,
          workerId,
          startTime: now,
          startLat: input.lat,
          startLng: input.lng,
          ...(input.lat !== undefined &&
            input.lng !== undefined && {
              locationPoints: {
                create: {
                  workerId,
                  companyId: currentUser.companyId,
                  latitude: input.lat,
                  longitude: input.lng,
                  recordedAt: now
                }
              }
            })
        },
        include: attendanceInclude
      });
    },
    { isolationLevel: "Serializable" }
  );
}

export async function endAttendance(currentUser: AuthContext, input: AttendanceLocationInput) {
  const workerId = requireEmployeeWorker(currentUser);

  return prisma.$transaction(
    async (tx) => {
      const activeSession = await tx.attendance.findFirst({
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

      const now = new Date();

      return tx.attendance.update({
        where: { id: activeSession.id },
        data: {
          endTime: now,
          endLat: input.lat,
          endLng: input.lng,
          ...(input.lat !== undefined &&
            input.lng !== undefined && {
              locationPoints: {
                create: {
                  workerId,
                  companyId: currentUser.companyId,
                  latitude: input.lat,
                  longitude: input.lng,
                  recordedAt: now
                }
              }
            })
        },
        include: attendanceInclude
      });
    },
    { isolationLevel: "Serializable" }
  );
}

export async function recordLocationPoint(currentUser: AuthContext, input: AttendanceLocationPointInput) {
  const workerId = requireEmployeeWorker(currentUser);

  return prisma.$transaction(async (tx) => {
    const activeSession = await tx.attendance.findFirst({
      where: {
        companyId: currentUser.companyId,
        workerId,
        endTime: null
      },
      orderBy: { startTime: "desc" },
      select: { id: true, startTime: true }
    });

    if (!activeSession) {
      throw new AppError(404, "No active attendance session was found.", "ATTENDANCE_NOT_ACTIVE");
    }

    const recordedAt = input.recordedAt ?? new Date();

    if (recordedAt < activeSession.startTime) {
      throw new AppError(
        400,
        "Location point cannot be recorded before the session started.",
        "INVALID_RECORD_TIME"
      );
    }

    return tx.attendanceLocationPoint.create({
      data: {
        attendanceId: activeSession.id,
        workerId,
        companyId: currentUser.companyId,
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy: input.accuracy,
        recordedAt
      }
    });
  });
}

export async function listAttendanceLocations(currentUser: AuthContext, attendanceId: string) {
  const attendance = await prisma.attendance.findFirst({
    where: {
      id: attendanceId,
      companyId: currentUser.companyId
    },
    select: {
      id: true,
      workerId: true
    }
  });

  const scopedAttendance = assertFound(attendance, "Attendance session was not found in this company.");

  if (currentUser.role === Role.EMPLOYEE) {
    const workerId = requireEmployeeWorker(currentUser);

    if (scopedAttendance.workerId !== workerId) {
      throw new AppError(403, "Employees can only view their own attendance locations.", "ATTENDANCE_LOCATION_FORBIDDEN");
    }
  }

  return prisma.attendanceLocationPoint.findMany({
    where: {
      attendanceId,
      companyId: currentUser.companyId
    },
    orderBy: { recordedAt: "asc" }
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
      include: attendanceListInclude,
      orderBy: { startTime: "desc" },
      skip: pagination.skip,
      take: pagination.take
    })
  ]);

  return toPaginatedResult(attendance, total, query);
}
