import { buildAttendanceStateRecord } from "./attendance";
import { hydrateWorkerRecord, normalizeWorkerRecord } from "./workers";

export function createWorkerActions({ attendanceByWorkerId, dispatch, projectsById, state }) {
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

  return {
    addWorker,
    deleteWorker,
    updateWorker
  };
}
