import { loadStoredCoreAppData } from "../../data/appDataStorage";
import { getInitialCoreAppData } from "../../data/coreAppData";
import { mockThreads } from "../../data/mockThreads";
import { buildAttendanceStateRecord, ensureAttendanceRecords } from "./attendance";
import { normalizeMaterialRequestRecord } from "./materials";
import { normalizeProjectRecord, syncProjectsWithWorkers } from "./projects";
import { normalizeTaskRecord } from "./tasks";
import { normalizeWorkerRecord } from "./workers";

export function finalizeCoreState(state) {
  const projects = state.projects.map((project) => normalizeProjectRecord(project));
  const workers = state.workers.map((worker) => normalizeWorkerRecord(worker, null, projects)).filter((worker) => worker.name);
  const attendance = ensureAttendanceRecords(workers, state.attendance);
  const syncedProjects = syncProjectsWithWorkers(projects, workers);
  const tasks = state.tasks
    .map((task) => normalizeTaskRecord(task, workers, syncedProjects))
    .filter((task) => task.employeeId && task.title && task.date);
  const materialRequests = state.materialRequests
    .map((request) => normalizeMaterialRequestRecord(request, workers, syncedProjects))
    .filter((request) => request.itemName && request.requestedById);

  return {
    ...state,
    attendance,
    materialRequests,
    projects: syncedProjects,
    tasks,
    workers
  };
}

export function createInitialAppState() {
  const storedState = loadStoredCoreAppData(getInitialCoreAppData());

  return finalizeCoreState({
    ...storedState,
    threads: mockThreads.map((thread) => ({
      ...thread,
      messages: thread.messages.map((message) => ({ ...message }))
    }))
  });
}

export function appDataReducer(state, action) {
  switch (action.type) {
    case "ADD_WORKER":
      return finalizeCoreState({
        ...state,
        workers: [action.payload, ...state.workers]
      });
    case "UPDATE_WORKER":
      return finalizeCoreState({
        ...state,
        workers: state.workers.map((worker) => (worker.id === action.payload.id ? action.payload : worker))
      });
    case "DELETE_WORKER":
      return finalizeCoreState({
        ...state,
        attendance: state.attendance.filter((record) => record.workerId !== action.payload.workerId),
        workers: state.workers.filter((worker) => worker.id !== action.payload.workerId)
      });
    case "ADD_TASK":
      return finalizeCoreState({
        ...state,
        workers:
          action.payload.projectId && action.payload.employeeId
            ? state.workers.map((worker) =>
                worker.id === action.payload.employeeId && !worker.projectIds.includes(action.payload.projectId)
                  ? { ...worker, projectIds: [...worker.projectIds, action.payload.projectId] }
                  : worker
              )
            : state.workers,
        tasks: [action.payload, ...state.tasks]
      });
    case "TOGGLE_TASK_STATUS":
      return finalizeCoreState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? {
                ...task,
                status: task.status === "completed" ? "pending" : "completed"
              }
            : task
        )
      });
    case "ADD_MATERIAL_REQUEST":
      return finalizeCoreState({
        ...state,
        materialRequests: [action.payload, ...state.materialRequests]
      });
    case "DELETE_MATERIAL_REQUEST":
      return finalizeCoreState({
        ...state,
        materialRequests: state.materialRequests.filter((request) => request.id !== action.payload.requestId)
      });
    case "UPDATE_MATERIAL_REQUEST_STATUS":
      return finalizeCoreState({
        ...state,
        materialRequests: state.materialRequests.map((request) =>
          request.id === action.payload.requestId
            ? {
                ...request,
                status: action.payload.status
              }
            : request
        )
      });
    case "SET_ATTENDANCE_RECORD":
      return finalizeCoreState({
        ...state,
        attendance: state.attendance.some((record) => record.workerId === action.payload.workerId)
          ? state.attendance.map((record) =>
              record.workerId === action.payload.workerId ? buildAttendanceStateRecord(action.payload, record) : record
            )
          : [...state.attendance, buildAttendanceStateRecord(action.payload)]
      });
    case "SEND_MESSAGE":
      return {
        ...state,
        threads: state.threads.map((thread) =>
          thread.id === action.payload.threadId
            ? {
                ...thread,
                messages: [...thread.messages, action.payload.message]
              }
            : thread
        )
      };
    default:
      return state;
  }
}
