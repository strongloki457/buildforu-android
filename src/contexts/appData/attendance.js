import { createEntityId } from "./ids";
import { normalizeLocation, normalizeOptionValue, normalizeText } from "./domainUtils";

export function normalizeAttendanceStatus(value) {
  return normalizeOptionValue(value, ["On Site", "Off Site"], "Off Site");
}

export function buildAttendanceStateRecord(record = {}, currentRecord) {
  const workerId = normalizeText(record.workerId ?? currentRecord?.workerId);

  return {
    id: currentRecord?.id ?? record.id ?? (workerId ? `attendance-${workerId}` : createEntityId("attendance")),
    workerId,
    currentStatus: normalizeAttendanceStatus(record.currentStatus ?? currentRecord?.currentStatus),
    workStartTime: record.workStartTime ?? currentRecord?.workStartTime ?? null,
    workEndTime: record.workEndTime ?? currentRecord?.workEndTime ?? null,
    workStartLocation: normalizeLocation(record.workStartLocation ?? currentRecord?.workStartLocation),
    workEndLocation: normalizeLocation(record.workEndLocation ?? currentRecord?.workEndLocation),
    lastKnownLocation: normalizeLocation(record.lastKnownLocation ?? currentRecord?.lastKnownLocation),
    lastKnownLocationAt: record.lastKnownLocationAt ?? currentRecord?.lastKnownLocationAt ?? null,
    locationPointCount: Number(record.locationPointCount ?? currentRecord?.locationPointCount ?? 0)
  };
}

export function ensureAttendanceRecords(workers, attendance) {
  const attendanceByWorkerId = new Map(
    (attendance ?? []).map((record) => [record.workerId, buildAttendanceStateRecord(record)])
  );

  return workers.map((worker) =>
    buildAttendanceStateRecord(
      {
        workerId: worker.id,
        currentStatus: worker.status ?? worker.attendance?.currentStatus,
        workStartTime: worker.attendance?.workStartTime,
        workEndTime: worker.attendance?.workEndTime,
        workStartLocation: worker.attendance?.workStartLocation,
        workEndLocation: worker.attendance?.workEndLocation,
        lastKnownLocation: worker.attendance?.lastKnownLocation,
        lastKnownLocationAt: worker.attendance?.lastKnownLocationAt,
        locationPointCount: worker.attendance?.locationPointCount
      },
      attendanceByWorkerId.get(worker.id)
    )
  );
}
