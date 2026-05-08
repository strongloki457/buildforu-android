import { buildAttendanceStateRecord } from "./attendance";
import { normalizeLocation } from "./domainUtils";

export function createAttendanceActions({ attendanceByWorkerId, currentUser, dispatch }) {
  const startWork = (workerId, options = {}) => {
    const currentWorkerId = currentUser?.apiWorkerId || currentUser?.workerId;

    if (currentUser?.role === "employee" && workerId !== currentWorkerId) {
      return null;
    }

    const attendanceRecord = buildAttendanceStateRecord(
      {
        workerId,
        currentStatus: "On Site",
        workStartTime: options.timestamp ?? new Date().toISOString(),
        workEndTime: null,
        workStartLocation: normalizeLocation(options.location),
        workEndLocation: null
      },
      attendanceByWorkerId.get(workerId)
    );

    dispatch({
      type: "SET_ATTENDANCE_RECORD",
      payload: attendanceRecord
    });

    return attendanceRecord;
  };

  const endWork = (workerId, options = {}) => {
    const currentWorkerId = currentUser?.apiWorkerId || currentUser?.workerId;

    if (currentUser?.role === "employee" && workerId !== currentWorkerId) {
      return null;
    }

    const attendanceRecord = buildAttendanceStateRecord(
      {
        workerId,
        currentStatus: "Off Site",
        workEndTime: options.timestamp ?? new Date().toISOString(),
        workEndLocation: normalizeLocation(options.location)
      },
      attendanceByWorkerId.get(workerId)
    );

    dispatch({
      type: "SET_ATTENDANCE_RECORD",
      payload: attendanceRecord
    });

    return attendanceRecord;
  };

  return {
    endWork,
    startWork
  };
}
