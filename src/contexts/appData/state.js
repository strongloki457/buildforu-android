import { mockThreads } from "../../data/mockThreads";
import { buildAttendanceStateRecord, ensureAttendanceRecords } from "./attendance";
import { normalizeMaterialRequestRecord } from "./materials";
import { normalizeProjectRecord, syncProjectsWithWorkers } from "./projects";
import { normalizeTaskRecord } from "./tasks";
import { normalizeWorkerRecord } from "./workers";

const SEED_TASK_DATE_OFFSETS = {
  "task-101": 0,
  "task-102": 0,
  "task-103": 0,
  "task-104": 1,
  "task-105": 2,
  "task-106": 3,
  "task-107": 4,
  "task-108": 5,
  "task-109": 6
};

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateWithOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return getLocalDateKey(date);
}

function alignSeedTaskDate(task) {
  if (!Object.prototype.hasOwnProperty.call(SEED_TASK_DATE_OFFSETS, task.id)) {
    return task;
  }

  return {
    ...task,
    date: getDateWithOffset(SEED_TASK_DATE_OFFSETS[task.id])
  };
}

function alignSeedAttendanceDate(record) {
  if (!String(record.id ?? "").startsWith("attendance-u-employee-")) {
    return record;
  }

  const today = getLocalDateKey();
  const withToday = (value) => (value ? `${today}T${String(value).split("T")[1] ?? "08:00:00"}` : value);

  return {
    ...record,
    workStartTime: withToday(record.workStartTime),
    workEndTime: withToday(record.workEndTime)
  };
}

export function finalizeCoreState(state) {
  const projects = state.projects.map((project) => normalizeProjectRecord(project));
  const workers = state.workers.map((worker) => normalizeWorkerRecord(worker, null, projects)).filter((worker) => worker.name);
  const attendance = ensureAttendanceRecords(workers, state.attendance.map((record) => alignSeedAttendanceDate(record)));
  const syncedProjects = syncProjectsWithWorkers(projects, workers);
  const tasks = state.tasks
    .map((task) => normalizeTaskRecord(alignSeedTaskDate(task), workers, syncedProjects))
    .filter((task) => task.title && task.date);
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
  return finalizeCoreState({
    attendance: [],
    materialRequests: [],
    projects: [],
    tasks: [],
    workers: [],
    threads: mockThreads.map((thread) => ({
      ...thread,
      messages: thread.messages.map((message) => ({ ...message }))
    }))
  });
}

export function appDataReducer(state, action) {
  switch (action.type) {
    case "SET_CORE_DATA":
      return finalizeCoreState({
        ...state,
        attendance: action.payload.attendance ?? [],
        materialRequests: action.payload.materialRequests ?? [],
        projects: action.payload.projects ?? [],
        tasks: action.payload.tasks ?? [],
        workers: action.payload.workers ?? []
      });
    case "ADD_PROJECT":
      return finalizeCoreState({
        ...state,
        projects: [action.payload, ...state.projects],
        workers: action.payload.assignedWorkerIds?.length
          ? state.workers.map((worker) =>
              action.payload.assignedWorkerIds.includes(worker.id) && !worker.projectIds.includes(action.payload.id)
                ? {
                    ...worker,
                    projectIds: [...worker.projectIds, action.payload.id]
                  }
                : worker
            )
          : state.workers
      });
    case "UPDATE_PROJECT":
      return finalizeCoreState({
        ...state,
        projects: state.projects.map((project) => (project.id === action.payload.id ? action.payload : project)),
        workers: state.workers.map((worker) => ({
          ...worker,
          projectIds: action.payload.assignedWorkerIds.includes(worker.id)
            ? Array.from(new Set([...worker.projectIds, action.payload.id]))
            : worker.projectIds.filter((projectId) => projectId !== action.payload.id)
        }))
      });
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
    case "UPDATE_TASK":
      return finalizeCoreState({
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.payload.id ? action.payload : task))
      });
    case "UPDATE_PROJECT_STATUS":
      return finalizeCoreState({
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? {
                ...project,
                status: action.payload.status
              }
            : project
        )
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
            ? { ...thread, messages: [...thread.messages, action.payload.message] }
            : thread
        )
      };
    case "SET_THREADS":
      return { ...state, threads: action.payload };
    case "ADD_THREAD":
      return {
        ...state,
        threads: state.threads.some((t) => t.id === action.payload.id)
          ? state.threads
          : [action.payload, ...state.threads]
      };
    default:
      return state;
  }
}
