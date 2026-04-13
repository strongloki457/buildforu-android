import { materialRequestStatusOptions } from "../../data/mockMaterials";
import { buildAttendanceStateRecord } from "./attendance";
import { normalizeLocation, normalizeOptionValue } from "./domainUtils";
import { createEntityId } from "./ids";
import { hydrateMaterialRequestRecord, normalizeMaterialRequestRecord } from "./materials";
import { hydrateTaskRecord, normalizeTaskRecord } from "./tasks";
import { hydrateWorkerRecord, normalizeWorkerRecord } from "./workers";

export function createAppDataActions({ attendanceByWorkerId, dispatch, projectsById, state, workersById }) {
  const addTask = (task) => {
    const normalizedTask = normalizeTaskRecord(task, state.workers, state.projects);

    if (!normalizedTask.employeeId || !normalizedTask.title || !normalizedTask.date || !normalizedTask.projectId) {
      return null;
    }

    dispatch({
      type: "ADD_TASK",
      payload: normalizedTask
    });

    return hydrateTaskRecord(normalizedTask, workersById, projectsById);
  };

  const addWorker = (worker) => {
    const normalizedWorker = normalizeWorkerRecord(worker, null, state.projects);

    if (!normalizedWorker.name) {
      return null;
    }

    dispatch({
      type: "ADD_WORKER",
      payload: normalizedWorker
    });

    return hydrateWorkerRecord(
      normalizedWorker,
      projectsById,
      new Map([[normalizedWorker.id, buildAttendanceStateRecord({ workerId: normalizedWorker.id })]])
    );
  };

  const updateWorker = (workerId, updates) => {
    const currentWorker = state.workers.find((worker) => worker.id === workerId);

    if (!currentWorker) {
      return null;
    }

    const normalizedWorker = normalizeWorkerRecord({ ...updates, id: workerId }, currentWorker, state.projects);

    if (!normalizedWorker.name) {
      return null;
    }

    dispatch({
      type: "UPDATE_WORKER",
      payload: normalizedWorker
    });

    return hydrateWorkerRecord(normalizedWorker, projectsById, attendanceByWorkerId);
  };

  const deleteWorker = (workerId) => {
    dispatch({
      type: "DELETE_WORKER",
      payload: { workerId }
    });
  };

  const addMaterialRequest = (request) => {
    const normalizedRequest = normalizeMaterialRequestRecord(request, state.workers, state.projects);

    if (!normalizedRequest.itemName || !normalizedRequest.requestedById) {
      return null;
    }

    dispatch({
      type: "ADD_MATERIAL_REQUEST",
      payload: normalizedRequest
    });

    return hydrateMaterialRequestRecord(normalizedRequest, workersById, projectsById);
  };

  const deleteMaterialRequest = (requestId) => {
    dispatch({
      type: "DELETE_MATERIAL_REQUEST",
      payload: { requestId }
    });
  };

  const updateMaterialRequestStatus = (requestId, status) => {
    const normalizedStatus = normalizeOptionValue(status, materialRequestStatusOptions, "");

    if (!normalizedStatus) {
      return null;
    }

    dispatch({
      type: "UPDATE_MATERIAL_REQUEST_STATUS",
      payload: {
        requestId,
        status: normalizedStatus
      }
    });

    return normalizedStatus;
  };

  const startWork = (workerId, options = {}) => {
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

  const toggleTaskStatus = (taskId) => {
    dispatch({
      type: "TOGGLE_TASK_STATUS",
      payload: { taskId }
    });
  };

  const sendMessage = ({ threadId, senderId, text, attachments = [] }) => {
    if (!text.trim() && !attachments.length) {
      return null;
    }

    const timestamp = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());

    const message = {
      id: createEntityId("m"),
      senderId,
      text: text.trim(),
      timestamp,
      attachments
    };

    dispatch({
      type: "SEND_MESSAGE",
      payload: {
        threadId,
        message
      }
    });

    return message;
  };

  return {
    addMaterialRequest,
    addTask,
    addWorker,
    deleteMaterialRequest,
    deleteWorker,
    endWork,
    sendMessage,
    startWork,
    toggleTaskStatus,
    updateMaterialRequestStatus,
    updateWorker
  };
}
