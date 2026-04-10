import { createContext, useEffect, useMemo, useReducer } from "react";
import { loadStoredCoreAppData, persistCoreAppData } from "../data/appDataStorage";
import { getInitialCoreAppData } from "../data/coreAppData";
import { mockFinance } from "../data/mockFinance";
import { materialRequestStatusOptions } from "../data/mockMaterials";
import { mockNotifications } from "../data/mockNotifications";
import { mockThreads } from "../data/mockThreads";
import { projectStatusOptions } from "../data/options";

export const AppDataContext = createContext(null);

const TASK_STATUS_OPTIONS = ["pending", "completed"];
const TASK_PRIORITY_OPTIONS = ["high", "medium", "low"];

function createEntityId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasOwnProperty(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeOptionValue(value, options, fallback) {
  const normalizedValue = normalizeText(value);
  const match = options.find((option) => option.toLowerCase() === normalizedValue.toLowerCase());
  return match ?? fallback;
}

function normalizeAttendanceStatus(value) {
  return normalizeOptionValue(value, ["On Site", "Off Site"], "Off Site");
}

function normalizeLocation(location) {
  if (!location) {
    return null;
  }

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    text: normalizeText(location.text)
  };
}

function clampProgress(value, fallback = 0) {
  const normalizedValue = Number(value);

  if (!Number.isFinite(normalizedValue)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, Math.round(normalizedValue)));
}

function resolveProjectId(value, projects) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return "";
  }

  const exactMatch = projects.find((project) => project.id === normalizedValue);

  if (exactMatch) {
    return exactMatch.id;
  }

  const nameMatch = projects.find((project) => project.name.toLowerCase() === normalizedValue.toLowerCase());
  return nameMatch?.id ?? "";
}

function sanitizeProjectIds(values, projects) {
  const items = Array.isArray(values) ? values : [values];
  const projectIds = items.map((value) => resolveProjectId(value, projects)).filter(Boolean);
  return Array.from(new Set(projectIds));
}

function buildAttendanceStateRecord(record, currentRecord) {
  const workerId = normalizeText(record?.workerId ?? currentRecord?.workerId);

  return {
    id: currentRecord?.id ?? record?.id ?? (workerId ? `attendance-${workerId}` : createEntityId("attendance")),
    workerId,
    currentStatus: normalizeAttendanceStatus(record?.currentStatus ?? currentRecord?.currentStatus),
    workStartTime: record?.workStartTime ?? currentRecord?.workStartTime ?? null,
    workEndTime: record?.workEndTime ?? currentRecord?.workEndTime ?? null,
    workStartLocation: normalizeLocation(record?.workStartLocation ?? currentRecord?.workStartLocation),
    workEndLocation: normalizeLocation(record?.workEndLocation ?? currentRecord?.workEndLocation)
  };
}

function ensureAttendanceRecords(workers, attendance) {
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
        workEndLocation: worker.attendance?.workEndLocation
      },
      attendanceByWorkerId.get(worker.id)
    )
  );
}

function normalizeWorkerRecord(worker, currentWorker, projects) {
  const name = hasOwnProperty(worker, "name") ? normalizeText(worker.name) : currentWorker?.name ?? "";
  const email = hasOwnProperty(worker, "email") ? normalizeText(worker.email) : currentWorker?.email ?? "";
  const phone = hasOwnProperty(worker, "phone") ? normalizeText(worker.phone) : currentWorker?.phone ?? "";
  const position = hasOwnProperty(worker, "position") ? normalizeText(worker.position) : currentWorker?.position ?? "";
  const availability = hasOwnProperty(worker, "availability")
    ? normalizeText(worker.availability) || "Available"
    : currentWorker?.availability ?? "Available";
  const nextShift = hasOwnProperty(worker, "nextShift")
    ? normalizeText(worker.nextShift) || "Not scheduled"
    : currentWorker?.nextShift ?? "Not scheduled";
  const completionRate = hasOwnProperty(worker, "completionRate")
    ? clampProgress(worker.completionRate, currentWorker?.completionRate ?? 0)
    : currentWorker?.completionRate ?? 0;

  let projectIds = currentWorker?.projectIds ?? [];

  if (hasOwnProperty(worker, "projectIds")) {
    projectIds = sanitizeProjectIds(worker.projectIds, projects);
  } else if (hasOwnProperty(worker, "assignedProject")) {
    projectIds = sanitizeProjectIds(worker.assignedProject ? [worker.assignedProject] : [], projects);
  }

  return {
    id: currentWorker?.id ?? worker.id ?? createEntityId("worker"),
    name,
    email,
    phone,
    position,
    positionKey: hasOwnProperty(worker, "position") && currentWorker
      ? null
      : worker.positionKey ?? worker.tradeKey ?? currentWorker?.positionKey ?? currentWorker?.tradeKey ?? null,
    availability,
    completionRate,
    nextShift,
    projectIds
  };
}

function normalizeProjectRecord(project, currentProject) {
  const name = hasOwnProperty(project, "name") ? normalizeText(project.name) : currentProject?.name ?? "";
  const phase = hasOwnProperty(project, "phase") ? normalizeText(project.phase) : currentProject?.phase ?? "";
  const budget = hasOwnProperty(project, "budget") ? normalizeText(project.budget) : currentProject?.budget ?? "";
  const health = hasOwnProperty(project, "health") ? normalizeText(project.health) : currentProject?.health ?? "Healthy";
  const location = hasOwnProperty(project, "location")
    ? normalizeText(project.location)
    : currentProject?.location ?? "";
  const startDate = hasOwnProperty(project, "startDate") ? normalizeText(project.startDate) : currentProject?.startDate ?? "";
  const deadline = hasOwnProperty(project, "deadline") ? normalizeText(project.deadline) : currentProject?.deadline ?? "";
  const notes = hasOwnProperty(project, "notes") ? normalizeText(project.notes) : currentProject?.notes ?? "";
  const status = normalizeOptionValue(
    hasOwnProperty(project, "status") ? project.status : currentProject?.status,
    projectStatusOptions,
    currentProject?.status ?? "Not Started"
  );

  return {
    id: currentProject?.id ?? project.id ?? createEntityId("project"),
    name,
    nameKey: hasOwnProperty(project, "name") && currentProject ? null : project.nameKey ?? currentProject?.nameKey ?? null,
    status,
    phase,
    phaseKey: hasOwnProperty(project, "phase") && currentProject ? null : project.phaseKey ?? currentProject?.phaseKey ?? null,
    progress: hasOwnProperty(project, "progress")
      ? clampProgress(project.progress, currentProject?.progress ?? 0)
      : currentProject?.progress ?? 0,
    budget,
    health,
    location,
    locationKey: hasOwnProperty(project, "location") && currentProject
      ? null
      : project.locationKey ?? currentProject?.locationKey ?? null,
    startDate,
    deadline,
    notes,
    notesKey: hasOwnProperty(project, "notes") && currentProject ? null : project.notesKey ?? currentProject?.notesKey ?? null,
    assignedWorkerIds: Array.isArray(project.assignedWorkerIds)
      ? Array.from(new Set(project.assignedWorkerIds.map((item) => normalizeText(item)).filter(Boolean)))
      : currentProject?.assignedWorkerIds ?? []
  };
}

function normalizeTaskRecord(task, workers, projects, currentTask) {
  const employeeId = hasOwnProperty(task, "employeeId") ? normalizeText(task.employeeId) : currentTask?.employeeId ?? "";
  const linkedWorker = workers.find((worker) => worker.id === employeeId);
  const projectId =
    hasOwnProperty(task, "projectId") || hasOwnProperty(task, "projectName")
      ? resolveProjectId(task.projectId ?? task.projectName, projects)
      : currentTask?.projectId ?? "";
  const linkedProject = projects.find((project) => project.id === projectId);
  const title = hasOwnProperty(task, "title") ? normalizeText(task.title) : currentTask?.title ?? "";
  const location = hasOwnProperty(task, "location")
    ? normalizeText(task.location)
    : currentTask?.location ?? linkedProject?.name ?? "";
  const date = hasOwnProperty(task, "date") ? normalizeText(task.date) : currentTask?.date ?? "";
  const priority = normalizeOptionValue(
    hasOwnProperty(task, "priority") ? task.priority : currentTask?.priority,
    TASK_PRIORITY_OPTIONS,
    currentTask?.priority ?? "medium"
  );
  const status = normalizeOptionValue(
    hasOwnProperty(task, "status") ? task.status : currentTask?.status,
    TASK_STATUS_OPTIONS,
    currentTask?.status ?? "pending"
  );

  return {
    id: currentTask?.id ?? task.id ?? createEntityId("task"),
    employeeId,
    assignee: linkedWorker?.name ?? (hasOwnProperty(task, "assignee") ? normalizeText(task.assignee) : currentTask?.assignee ?? ""),
    title,
    titleKey: hasOwnProperty(task, "title") && currentTask ? null : task.titleKey ?? currentTask?.titleKey ?? null,
    projectId,
    projectName: linkedProject?.name ?? (hasOwnProperty(task, "projectName") ? normalizeText(task.projectName) : currentTask?.projectName ?? ""),
    projectNameKey:
      linkedProject?.nameKey ??
      (hasOwnProperty(task, "projectName") && currentTask ? null : task.projectNameKey ?? currentTask?.projectNameKey ?? null),
    location,
    locationKey: hasOwnProperty(task, "location") && currentTask
      ? null
      : task.locationKey ?? currentTask?.locationKey ?? linkedProject?.nameKey ?? null,
    date,
    status,
    priority
  };
}

function normalizeMaterialRequestRecord(request, workers, projects, currentRequest) {
  const requestedById = hasOwnProperty(request, "requestedById")
    ? normalizeText(request.requestedById)
    : currentRequest?.requestedById ?? "";
  const linkedWorker = workers.find((worker) => worker.id === requestedById);
  const projectId =
    hasOwnProperty(request, "projectId") || hasOwnProperty(request, "projectName")
      ? resolveProjectId(request.projectId ?? request.projectName, projects)
      : currentRequest?.projectId ?? "";
  const linkedProject = projects.find((project) => project.id === projectId);
  const status = normalizeOptionValue(
    hasOwnProperty(request, "status") ? request.status : currentRequest?.status,
    materialRequestStatusOptions,
    currentRequest?.status ?? "Pending"
  );

  return {
    id: currentRequest?.id ?? request.id ?? createEntityId("request"),
    itemName: hasOwnProperty(request, "itemName") ? normalizeText(request.itemName) : currentRequest?.itemName ?? "",
    itemNameKey: hasOwnProperty(request, "itemName") && currentRequest
      ? null
      : request.itemNameKey ?? currentRequest?.itemNameKey ?? null,
    quantity: hasOwnProperty(request, "quantity") ? normalizeText(request.quantity) : currentRequest?.quantity ?? "",
    note: hasOwnProperty(request, "note") ? normalizeText(request.note) : currentRequest?.note ?? "",
    noteKey: hasOwnProperty(request, "note") && currentRequest ? null : request.noteKey ?? currentRequest?.noteKey ?? null,
    status,
    requestedById,
    requestedBy:
      linkedWorker?.name ??
      (hasOwnProperty(request, "requestedBy") ? normalizeText(request.requestedBy) : currentRequest?.requestedBy ?? ""),
    projectId,
    projectName:
      linkedProject?.name ??
      (hasOwnProperty(request, "projectName") ? normalizeText(request.projectName) : currentRequest?.projectName ?? ""),
    projectNameKey:
      linkedProject?.nameKey ??
      (hasOwnProperty(request, "projectName") && currentRequest
        ? null
        : request.projectNameKey ?? currentRequest?.projectNameKey ?? null),
    createdAt: hasOwnProperty(request, "createdAt")
      ? request.createdAt ?? currentRequest?.createdAt ?? new Date().toISOString()
      : currentRequest?.createdAt ?? new Date().toISOString()
  };
}

function syncProjectsWithWorkers(projects, workers) {
  return projects.map((project) => ({
    ...project,
    assignedWorkerIds: workers.filter((worker) => worker.projectIds.includes(project.id)).map((worker) => worker.id)
  }));
}

function hydrateWorkerRecord(worker, projectsById, attendanceByWorkerId) {
  const assignedProjects = worker.projectIds.map((projectId) => projectsById.get(projectId)).filter(Boolean);
  const primaryProject = assignedProjects[0] ?? null;
  const attendance = attendanceByWorkerId.get(worker.id) ?? buildAttendanceStateRecord({ workerId: worker.id });

  return {
    ...worker,
    attendance,
    assignedProject: primaryProject?.name ?? "",
    assignedProjectKey: primaryProject?.nameKey ?? null,
    assignedProjects,
    location: primaryProject?.name ?? "",
    locationKey: primaryProject?.nameKey ?? null,
    status: attendance.currentStatus,
    trade: worker.position,
    tradeKey: worker.positionKey
  };
}

function hydrateTaskRecord(task, workersById, projectsById) {
  const worker = workersById.get(task.employeeId) ?? null;
  const project = projectsById.get(task.projectId) ?? null;

  return {
    ...task,
    assignee: worker?.name ?? task.assignee,
    projectName: project?.name ?? task.projectName,
    projectNameKey: project?.nameKey ?? task.projectNameKey
  };
}

function hydrateMaterialRequestRecord(request, workersById, projectsById) {
  const worker = workersById.get(request.requestedById) ?? null;
  const project = projectsById.get(request.projectId) ?? null;

  return {
    ...request,
    requestedBy: worker?.name ?? request.requestedBy,
    projectName: project?.name ?? request.projectName,
    projectNameKey: project?.nameKey ?? request.projectNameKey
  };
}

function finalizeCoreState(state) {
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

function createInitialAppState() {
  const storedState = loadStoredCoreAppData(getInitialCoreAppData());

  return finalizeCoreState({
    ...storedState,
    threads: mockThreads.map((thread) => ({
      ...thread,
      messages: thread.messages.map((message) => ({ ...message }))
    }))
  });
}

function appDataReducer(state, action) {
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

export function AppDataProvider({ children }) {
  const [state, dispatch] = useReducer(appDataReducer, undefined, createInitialAppState);

  useEffect(() => {
    persistCoreAppData(state);
  }, [state.attendance, state.materialRequests, state.projects, state.tasks, state.workers]);

  const projectsById = useMemo(() => new Map(state.projects.map((project) => [project.id, project])), [state.projects]);
  const attendanceByWorkerId = useMemo(
    () => new Map(state.attendance.map((record) => [record.workerId, record])),
    [state.attendance]
  );

  const workers = useMemo(
    () => state.workers.map((worker) => hydrateWorkerRecord(worker, projectsById, attendanceByWorkerId)),
    [attendanceByWorkerId, projectsById, state.workers]
  );
  const workersById = useMemo(() => new Map(workers.map((worker) => [worker.id, worker])), [workers]);

  const tasks = useMemo(
    () => state.tasks.map((task) => hydrateTaskRecord(task, workersById, projectsById)),
    [projectsById, state.tasks, workersById]
  );

  const projects = useMemo(
    () =>
      state.projects.map((project) => ({
        ...project,
        assignedWorkers: workers.filter((worker) => worker.projectIds.includes(project.id)),
        taskCount: tasks.filter((task) => task.projectId === project.id).length,
        openTaskCount: tasks.filter((task) => task.projectId === project.id && task.status === "pending").length
      })),
    [state.projects, tasks, workers]
  );

  const materialRequests = useMemo(
    () => state.materialRequests.map((request) => hydrateMaterialRequestRecord(request, workersById, projectsById)),
    [projectsById, state.materialRequests, workersById]
  );

  const attendance = useMemo(
    () =>
      state.attendance.map((record) => ({
        ...record,
        worker: workersById.get(record.workerId) ?? null
      })),
    [state.attendance, workersById]
  );

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

  const value = useMemo(
    () => ({
      attendance,
      tasks,
      threads: state.threads,
      workers,
      materialRequests,
      projects,
      finance: mockFinance,
      notifications: mockNotifications,
      addTask,
      addWorker,
      updateWorker,
      deleteWorker,
      addMaterialRequest,
      deleteMaterialRequest,
      updateMaterialRequestStatus,
      startWork,
      endWork,
      toggleTaskStatus,
      sendMessage
    }),
    [attendance, materialRequests, projects, state.threads, tasks, workers]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
