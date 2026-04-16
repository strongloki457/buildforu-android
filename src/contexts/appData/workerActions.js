import { buildAttendanceStateRecord } from "./attendance";
import { hydrateWorkerRecord, normalizeWorkerRecord } from "./workers";

function applyWorkspaceScope(payload, currentUser) {
  return {
    ...payload,
    companyId: payload.companyId ?? currentUser?.companyId,
    workspaceId: payload.workspaceId ?? currentUser?.workspaceId
  };
}

export function createWorkerActions({ attendanceByWorkerId, currentUser, dispatch, projectsById, state }) {
  const addWorker = (worker) => {
    if (currentUser?.role && currentUser.role !== "admin") {
      return null;
    }

    const normalizedWorker = normalizeWorkerRecord(applyWorkspaceScope(worker, currentUser), null, state.projects);

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
    if (currentUser?.role && currentUser.role !== "admin") {
      return null;
    }

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
    if (currentUser?.role && currentUser.role !== "admin") {
      return null;
    }

    dispatch({
      type: "DELETE_WORKER",
      payload: { workerId }
    });
  };

  return {
    addWorker,
    deleteWorker,
    updateWorker
  };
}
