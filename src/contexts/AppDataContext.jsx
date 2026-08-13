import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { createContext, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ApiError } from "../api/client";
import { attendanceApi } from "../api/attendance.api";
import { chatApi } from "../api/chat.api";
import { materialsApi } from "../api/materials.api";
import { notificationsApi } from "../api/notifications.api";
import { projectsApi } from "../api/projects.api";
import { tasksApi } from "../api/tasks.api";
import { workersApi } from "../api/workers.api";
import { mockFinance } from "../data/mockFinance";
import { useAuth } from "../hooks/useAuth";
import { hydrateMaterialRequestRecord, normalizeMaterialRequestRecord } from "./appData/materials";
import { normalizeProjectRecord } from "./appData/projects";
import { appDataReducer, createInitialAppState } from "./appData/state";
import { hydrateTaskRecord, normalizeTaskRecord } from "./appData/tasks";
import { hydrateWorkerRecord, normalizeWorkerRecord } from "./appData/workers";

export const AppDataContext = createContext(null);

const isNativeApp = Capacitor.isNativePlatform();
const OFFLINE_CACHE_PREFIX = "buildforu-offline-cache-";

// Native-only offline fallback: on a network error we'd otherwise wipe the screen to
// nothing (see the loadBackendData catch below). Web/desktop keep their existing
// behavior — only the Android/Capacitor build reads/writes this cache.
async function readOfflineCache(companyId) {
  if (!isNativeApp || !companyId) return null;
  try {
    const { value } = await Preferences.get({ key: OFFLINE_CACHE_PREFIX + companyId });
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

async function writeOfflineCache(companyId, payload) {
  if (!isNativeApp || !companyId) return;
  try {
    await Preferences.set({ key: OFFLINE_CACHE_PREFIX + companyId, value: JSON.stringify(payload) });
  } catch {
    // best-effort cache — ignore write failures (e.g. storage full)
  }
}

const EMPTY_CORE_DATA = {
  attendance: [],
  materialRequests: [],
  projects: [],
  tasks: [],
  workers: []
};

const PROJECT_STATUS_TO_API = {
  "To Start": "TO_START",
  "In Progress": "IN_PROGRESS",
  Completed: "COMPLETED"
};

const PROJECT_STATUS_FROM_API = {
  TO_START: "To Start",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed"
};

const TASK_STATUS_TO_API = {
  pending: "TODO",
  completed: "DONE"
};

const TASK_STATUS_FROM_API = {
  TODO: "pending",
  IN_PROGRESS: "pending",
  DONE: "completed"
};

const MATERIAL_STATUS_TO_API = {
  Pending: "PENDING",
  Ordered: "ORDERED",
  Purchased: "PURCHASED",
  Rejected: "REJECTED"
};

const MATERIAL_STATUS_FROM_API = {
  PENDING: "Pending",
  ORDERED: "Ordered",
  PURCHASED: "Purchased",
  REJECTED: "Rejected"
};

const PROJECT_STATUS_PROGRESS = {
  "To Start": 0,
  "In Progress": 45,
  Completed: 100
};

const OPEN_MATERIAL_STATUSES = new Set(["Pending", "Ordered"]);

function createLookup(items) {
  return new Map(items.map((item) => [item.id, item]));
}

function getPageData(response) {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response?.data) ? response.data : [];
}

function toDateKey(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function toLocation(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return null;
  }

  return {
    latitude: Number(lat),
    longitude: Number(lng)
  };
}

function formatDataError(error) {
  if (error instanceof ApiError) {
    if (error.code === "DATABASE_UNAVAILABLE" || error.status === 503) {
      return "Database connection is unavailable. Start PostgreSQL and run migrations.";
    }

    if (error.status === 403) {
      return "You do not have permission to load this data.";
    }

    if (error.status === 401) {
      return "Your session expired. Please sign in again.";
    }

    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function mapApiWorker(worker) {
  const projectIds = Array.isArray(worker?.projects)
    ? worker.projects
        .map((assignment) => assignment.project?.id || assignment.projectId)
        .filter(Boolean)
    : [];

  return {
    id: worker.id,
    companyId: worker.companyId,
    workspaceId: worker.companyId,
    name: worker.name,
    email: worker.email ?? "",
    phone: worker.phone ?? "",
    notes: worker.notes ?? "",
    hasLinkedLogin: Boolean(worker.user),
    projectIds
  };
}

function mapApiProject(project) {
  const assignedWorkerIds = Array.isArray(project?.workers)
    ? project.workers.map((assignment) => assignment.worker?.id || assignment.workerId).filter(Boolean)
    : [];

  return {
    id: project.id,
    companyId: project.companyId,
    workspaceId: project.companyId,
    name: project.name,
    status: PROJECT_STATUS_FROM_API[project.status] ?? project.status,
    notes: project.note ?? "",
    assignedWorkerIds
  };
}

function mapApiTask(task) {
  return {
    id: task.id,
    companyId: task.companyId,
    workspaceId: task.companyId,
    title: task.title,
    location: task.description ?? task.project?.name ?? "",
    date: toDateKey(task.date),
    status: TASK_STATUS_FROM_API[task.status] ?? "pending",
    priority: "medium",
    employeeId: task.workerId ?? task.worker?.id ?? "",
    assignee: task.worker?.name ?? "",
    projectId: task.projectId ?? task.project?.id ?? "",
    projectName: task.project?.name ?? ""
  };
}

function mapApiAttendance(record) {
  const latestPoint = Array.isArray(record.locationPoints) ? record.locationPoints[0] : null;

  return {
    id: record.id,
    workerId: record.workerId,
    currentStatus: record.endTime ? "Off Site" : "On Site",
    workStartTime: record.startTime ?? null,
    workEndTime: record.endTime ?? null,
    workStartLocation: toLocation(record.startLat, record.startLng),
    workEndLocation: toLocation(record.endLat, record.endLng),
    lastKnownLocation: latestPoint ? toLocation(latestPoint.latitude, latestPoint.longitude) : null,
    lastKnownLocationAt: latestPoint?.recordedAt ?? null,
    locationPointCount: Number(record._count?.locationPoints ?? record.locationPointCount ?? 0)
  };
}

function mapLatestAttendance(records) {
  const latestByWorker = new Map();

  getPageData(records).forEach((record) => {
    if (!record.workerId || latestByWorker.has(record.workerId)) {
      return;
    }

    latestByWorker.set(record.workerId, mapApiAttendance(record));
  });

  return Array.from(latestByWorker.values());
}

function mapApiMaterialRequest(request) {
  return {
    id: request.id,
    companyId: request.companyId,
    workspaceId: request.companyId,
    itemName: request.itemName,
    quantity: request.quantity ?? "",
    note: request.note ?? "",
    status: MATERIAL_STATUS_FROM_API[request.status] ?? request.status,
    requestedById: request.requesterWorkerId ?? request.requesterWorker?.id ?? "",
    requestedBy: request.requesterWorker?.name ?? "",
    projectId: request.projectId ?? request.project?.id ?? "",
    projectName: request.project?.name ?? "",
    createdAt: request.createdAt
  };
}

function getCurrentWorkerId(user) {
  return user?.apiWorkerId || user?.workerId || "";
}

function ensureEmployeeWorker(workers, user, projects) {
  const workerId = getCurrentWorkerId(user);

  if (user?.role !== "employee" || !workerId || workers.some((worker) => worker.id === workerId)) {
    return workers;
  }

  const projectIds = projects
    .filter((project) => project.assignedWorkerIds?.includes(workerId))
    .map((project) => project.id);

  return [
    {
      id: workerId,
      companyId: user.companyId,
      workspaceId: user.companyId,
      name: user.name,
      email: user.email,
      projectIds
    },
    ...workers
  ];
}

function normalizeCoreData({ attendance, materialRequests, projects, tasks, workers }, user) {
  const normalizedProjects = projects.map((project) => normalizeProjectRecord(project));
  const normalizedWorkers = ensureEmployeeWorker(workers, user, normalizedProjects).map((worker) =>
    normalizeWorkerRecord(worker, null, normalizedProjects)
  );
  const normalizedTasks = tasks
    .map((task) => normalizeTaskRecord(task, normalizedWorkers, normalizedProjects))
    .filter((task) => task.title && task.date);
  const normalizedMaterials = materialRequests
    .map((request) => normalizeMaterialRequestRecord(request, normalizedWorkers, normalizedProjects))
    .filter((request) => request.itemName && request.requestedById);

  return {
    attendance,
    materialRequests: normalizedMaterials,
    projects: normalizedProjects,
    tasks: normalizedTasks,
    workers: normalizedWorkers
  };
}

function workerPayload(input) {
  return {
    name: input.name,
    email: input.email || "",
    phone: input.phone || "",
    notes: input.notes || "",
    projectIds: input.projectIds || [],
    createLogin: Boolean(input.createLogin),
    ...(input.linkExistingUserId ? { linkExistingUserId: input.linkExistingUserId } : {})
  };
}

function projectPayload(input) {
  return {
    name: input.name,
    status: PROJECT_STATUS_TO_API[input.status] ?? "TO_START",
    note: input.notes || input.note || input.phase || input.location || "",
    workerIds: input.assignedWorkerIds || input.workerIds || []
  };
}

function taskPayload(input) {
  return {
    title: input.title,
    description: input.location || input.description || "",
    date: input.date,
    status: TASK_STATUS_TO_API[input.status] ?? "TODO",
    workerId: input.employeeId || input.workerId || "",
    projectId: input.projectId || ""
  };
}

function attendanceLocationPayload(options = {}) {
  const location = options.location || {};

  return {
    lat: location.latitude,
    lng: location.longitude
  };
}

function materialPayload(input, user) {
  return {
    itemName: input.itemName,
    quantity: input.quantity || "",
    note: input.note || "",
    projectId: input.projectId || "",
    requesterWorkerId: user?.role === "admin" ? input.requestedById || input.requesterWorkerId || "" : ""
  };
}

function getProjectProgress(project, linkedTasks) {
  const completedTaskCount = linkedTasks.filter((task) => task.status === "completed").length;

  if (linkedTasks.length) {
    return Math.round((completedTaskCount / linkedTasks.length) * 100);
  }

  const storedProgress = Number(project.progress);

  if (Number.isFinite(storedProgress) && storedProgress > 0) {
    return Math.max(0, Math.min(100, Math.round(storedProgress)));
  }

  return PROJECT_STATUS_PROGRESS[project.status] ?? 0;
}

function formatTimestamp(isoString) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(isoString));
}

function mapApiThread(thread, currentUserId) {
  const otherParticipant = thread.participants.find((p) => p.userId !== currentUserId);
  return {
    id: thread.id,
    name: otherParticipant?.user?.name ?? "Unknown",
    participants: thread.participants.map((p) => p.userId),
    messages: thread.messages.map((msg) => {
      const apiAttachments = Array.isArray(msg.attachments) ? msg.attachments : [];
      return {
        id: msg.id,
        senderId: msg.senderId,
        text: msg.text,
        timestamp: formatTimestamp(msg.createdAt),
        attachments: apiAttachments.length
          ? apiAttachments.map((a) => ({ ...a, previewUrl: a.data }))
          : undefined
      };
    })
  };
}

export function AppDataProvider({ children }) {
  const { user, refreshUser } = useAuth();
  const [state, dispatch] = useReducer(appDataReducer, undefined, createInitialAppState);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [notifications, setNotifications] = useState([]);

  const loadBackendData = useCallback(async () => {
    if (!user) {
      dispatch({ type: "SET_CORE_DATA", payload: EMPTY_CORE_DATA });
      setDataError("");
      return;
    }

    setIsDataLoading(true);
    setDataError("");

    try {
      const [workersResponse, projectsResponse, tasksResponse, attendanceResponse, materialsResponse] =
        await Promise.all([
          user.role === "admin" ? workersApi.list({ limit: 500 }) : Promise.resolve({ data: [] }),
          projectsApi.list({ limit: 500 }),
          tasksApi.list({ limit: 500 }),
          attendanceApi.list({ limit: 500 }),
          materialsApi.list({ limit: 500 })
        ]);

      const mappedProjects = getPageData(projectsResponse).map(mapApiProject);
      const mappedWorkers = getPageData(workersResponse).map(mapApiWorker);
      const mappedTasks = getPageData(tasksResponse).map(mapApiTask);
      const mappedAttendance = mapLatestAttendance(attendanceResponse);
      const mappedMaterials = getPageData(materialsResponse).map(mapApiMaterialRequest);

      chatApi
        .getThreads()
        .then((threadsResponse) => {
          const mappedThreads = (threadsResponse?.threads ?? []).map((t) => mapApiThread(t, user.id));
          dispatch({ type: "SET_THREADS", payload: mappedThreads });
        })
        .catch(() => {
          dispatch({ type: "SET_THREADS", payload: [] });
        });

      const corePayload = normalizeCoreData(
        {
          attendance: mappedAttendance,
          materialRequests: mappedMaterials,
          projects: mappedProjects,
          tasks: mappedTasks,
          workers: mappedWorkers
        },
        user
      );

      dispatch({ type: "SET_CORE_DATA", payload: corePayload });
      void writeOfflineCache(user.companyId, corePayload);
    } catch (error) {
      const isOffline = error instanceof ApiError && error.code === "NETWORK_ERROR";
      const cached = isOffline ? await readOfflineCache(user.companyId) : null;

      if (cached) {
        dispatch({ type: "SET_CORE_DATA", payload: cached });
        setDataError("You're offline — showing the last saved data.");
      } else {
        dispatch({ type: "SET_CORE_DATA", payload: EMPTY_CORE_DATA });
        setDataError(formatDataError(error));
      }
    } finally {
      setIsDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  const lastMutationErrorRef = useRef(null);

  const runMutation = useCallback(async (operation, { rethrowCodes = [] } = {}) => {
    lastMutationErrorRef.current = null;
    try {
      setDataError("");
      return await operation();
    } catch (error) {
      if (rethrowCodes.length && error instanceof ApiError && rethrowCodes.includes(error.code)) {
        throw error;
      }
      const message = formatDataError(error);
      lastMutationErrorRef.current = message;
      setDataError(message);
      return null;
    }
  }, []);

  const getLastMutationError = useCallback(() => lastMutationErrorRef.current, []);

  const projectsById = useMemo(() => createLookup(state.projects), [state.projects]);
  const attendanceByWorkerId = useMemo(
    () => new Map(state.attendance.map((record) => [record.workerId, record])),
    [state.attendance]
  );

  const workers = useMemo(
    () => state.workers.map((worker) => hydrateWorkerRecord(worker, projectsById, attendanceByWorkerId)),
    [attendanceByWorkerId, projectsById, state.workers]
  );
  const workersById = useMemo(() => createLookup(workers), [workers]);

  const tasks = useMemo(
    () => state.tasks.map((task) => hydrateTaskRecord(task, workersById, projectsById)),
    [projectsById, state.tasks, workersById]
  );

  const materialRequests = useMemo(
    () => state.materialRequests.map((request) => hydrateMaterialRequestRecord(request, workersById, projectsById)),
    [projectsById, state.materialRequests, workersById]
  );

  const projects = useMemo(
    () =>
      state.projects.map((project) => {
        const linkedTasks = tasks.filter((task) => task.projectId === project.id);
        const linkedMaterialRequests = materialRequests.filter((request) => request.projectId === project.id);
        const completedTaskCount = linkedTasks.filter((task) => task.status === "completed").length;
        const openTaskCount = linkedTasks.length - completedTaskCount;
        const openMaterialCount = linkedMaterialRequests.filter((request) =>
          OPEN_MATERIAL_STATUSES.has(request.status)
        ).length;

        return {
          ...project,
          assignedWorkers: workers.filter((worker) => worker.projectIds.includes(project.id)),
          linkedTasks,
          linkedMaterialRequests,
          taskCount: linkedTasks.length,
          completedTaskCount,
          openTaskCount,
          materialRequestCount: linkedMaterialRequests.length,
          openMaterialCount,
          progress: getProjectProgress(project, linkedTasks)
        };
      }),
    [materialRequests, state.projects, tasks, workers]
  );

  const attendance = useMemo(
    () =>
      state.attendance.map((record) => ({
        ...record,
        worker: workersById.get(record.workerId) ?? null
      })),
    [state.attendance, workersById]
  );

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = () => {
      notificationsApi.list().then((res) => setNotifications(res?.notifications ?? [])).catch(() => {});
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const actions = useMemo(
    () => ({
      async sendMessage({ threadId, text, attachments = [] }) {
        if (!text.trim() && !attachments.length) return null;

        return runMutation(async () => {
          const response = await chatApi.sendMessage(threadId, text.trim(), attachments);
          const msg = response.message;
          const apiAttachments = Array.isArray(msg.attachments) ? msg.attachments : [];
          const mappedMsg = {
            id: msg.id,
            senderId: msg.senderId,
            text: msg.text,
            timestamp: formatTimestamp(msg.createdAt),
            attachments: apiAttachments.length
              ? apiAttachments.map((a) => ({ ...a, previewUrl: a.data }))
              : attachments.length ? attachments : undefined
          };
          dispatch({ type: "SEND_MESSAGE", payload: { threadId, message: mappedMsg } });
          return mappedMsg;
        });
      },
      async deleteMessage({ threadId, messageId }) {
        return runMutation(async () => {
          await chatApi.deleteMessage(threadId, messageId);
          dispatch({ type: "DELETE_MESSAGE", payload: { threadId, messageId } });
          return true;
        });
      },
      removeMessage({ threadId, messageId }) {
        dispatch({ type: "DELETE_MESSAGE", payload: { threadId, messageId } });
      },
      async startThread(otherUserId) {
        return runMutation(async () => {
          const response = await chatApi.createThread(otherUserId);
          const thread = mapApiThread(response.thread, user?.id ?? "");
          dispatch({ type: "ADD_THREAD", payload: thread });
          return thread;
        });
      },
      async addWorker(input) {
        return runMutation(async () => {
          if (user?.role !== "admin") throw new Error("Only admins can add workers.");
          const response = await workersApi.createWorker(workerPayload(input));
          const normalizedWorker = normalizeWorkerRecord(mapApiWorker(response.worker), null, state.projects);
          dispatch({ type: "ADD_WORKER", payload: normalizedWorker });
          if (response.selfLinked) {
            // Admin linked themselves as a worker — refresh auth to reveal the role-switch button
            void refreshUser();
          }
          return { ...normalizedWorker, _temporaryPassword: response.temporaryPassword || "" };
        }, { rethrowCodes: ["EMAIL_EXISTS_OTHER_COMPANY"] });
      },
      async updateWorker(workerId, input) {
        return runMutation(async () => {
          if (user?.role !== "admin") throw new Error("Only admins can update workers.");
          const response = await workersApi.updateWorker(workerId, workerPayload(input));
          const worker = response.worker ?? response;
          const temporaryPassword = response.temporaryPassword || "";
          const normalizedWorker = normalizeWorkerRecord(mapApiWorker(worker), workersById.get(workerId), state.projects);
          dispatch({ type: "UPDATE_WORKER", payload: normalizedWorker });
          return { ...normalizedWorker, _temporaryPassword: temporaryPassword };
        }, { rethrowCodes: ["EMAIL_EXISTS_OTHER_COMPANY"] });
      },
      async deleteWorker(workerId) {
        return runMutation(async () => {
          if (user?.role !== "admin") throw new Error("Only admins can delete workers.");
          await workersApi.deleteWorker(workerId);
          dispatch({ type: "DELETE_WORKER", payload: { workerId } });
          return true;
        });
      },
      async addProject(input) {
        return runMutation(async () => {
          if (user?.role !== "admin") throw new Error("Only admins can add projects.");
          const response = await projectsApi.createProject(projectPayload(input));
          const apiProject = mapApiProject(response.project);
          const normalizedProject = normalizeProjectRecord({
            ...apiProject,
            phase: input.phase ?? apiProject.phase,
            budget: input.budget ?? apiProject.budget,
            location: input.location ?? apiProject.location,
            startDate: input.startDate ?? apiProject.startDate,
            deadline: input.deadline ?? apiProject.deadline,
            notes: input.notes || apiProject.notes,
            assignedWorkerIds: apiProject.assignedWorkerIds?.length
              ? apiProject.assignedWorkerIds
              : input.assignedWorkerIds ?? []
          });
          dispatch({ type: "ADD_PROJECT", payload: normalizedProject });
          return normalizedProject;
        });
      },
      async updateProject(projectId, input) {
        return runMutation(async () => {
          if (user?.role !== "admin") throw new Error("Only admins can update projects.");
          const existingProject = projectsById.get(projectId);
          const response = await projectsApi.updateProject(projectId, projectPayload(input));
          const apiProject = mapApiProject(response.project);
          const normalizedProject = normalizeProjectRecord(
            {
              ...apiProject,
              phase: input.phase ?? existingProject?.phase,
              budget: input.budget ?? existingProject?.budget,
              location: input.location ?? existingProject?.location,
              startDate: input.startDate ?? existingProject?.startDate,
              deadline: input.deadline ?? existingProject?.deadline,
              notes: input.notes || apiProject.notes,
              assignedWorkerIds: apiProject.assignedWorkerIds?.length
                ? apiProject.assignedWorkerIds
                : input.assignedWorkerIds ?? []
            },
            existingProject
          );
          dispatch({ type: "UPDATE_PROJECT", payload: normalizedProject });
          return normalizedProject;
        });
      },
      async updateProjectStatus(projectId, status) {
        return runMutation(async () => {
          if (user?.role !== "admin") throw new Error("Only admins can update project status.");
          const response = await projectsApi.updateProject(projectId, {
            status: PROJECT_STATUS_TO_API[status] ?? status
          });
          const normalizedProject = normalizeProjectRecord(mapApiProject(response.project), projectsById.get(projectId));
          dispatch({
            type: "UPDATE_PROJECT_STATUS",
            payload: {
              projectId,
              status: normalizedProject.status
            }
          });
          return normalizedProject;
        });
      },
      async addTask(input) {
        return runMutation(async () => {
          if (user?.role && user.role !== "admin") throw new Error("Only admins can add tasks.");
          const response = await tasksApi.createTask(taskPayload(input));
          const normalizedTask = normalizeTaskRecord(mapApiTask(response.task), state.workers, state.projects);
          dispatch({ type: "ADD_TASK", payload: normalizedTask });
          return hydrateTaskRecord(normalizedTask, workersById, projectsById);
        });
      },
      async toggleTaskStatus(taskId) {
        return runMutation(async () => {
          const existingTask = state.tasks.find((task) => task.id === taskId);
          if (!existingTask) throw new Error("Task not found.");
          const nextStatus = existingTask.status === "completed" ? "TODO" : "DONE";
          const response = await tasksApi.updateTask(taskId, { status: nextStatus });
          const normalizedTask = normalizeTaskRecord(mapApiTask(response.task), state.workers, state.projects, existingTask);
          dispatch({ type: "UPDATE_TASK", payload: normalizedTask });
          return normalizedTask;
        });
      },
      async startWork(workerId, options = {}) {
        return runMutation(async () => {
          const currentWorkerId = getCurrentWorkerId(user);
          if (user?.role === "employee" && workerId !== currentWorkerId)
            throw new Error("You can only start your own work session.");
          const response = await attendanceApi.start(attendanceLocationPayload(options));
          const attendanceRecord = mapApiAttendance(response.attendance);
          dispatch({ type: "SET_ATTENDANCE_RECORD", payload: attendanceRecord });
          return attendanceRecord;
        });
      },
      async endWork(workerId, options = {}) {
        return runMutation(async () => {
          const currentWorkerId = getCurrentWorkerId(user);
          if (user?.role === "employee" && workerId !== currentWorkerId)
            throw new Error("You can only end your own work session.");
          const response = await attendanceApi.end(attendanceLocationPayload(options));
          const attendanceRecord = mapApiAttendance(response.attendance);
          dispatch({ type: "SET_ATTENDANCE_RECORD", payload: attendanceRecord });
          return attendanceRecord;
        });
      },
      async addMaterialRequest(input) {
        return runMutation(async () => {
          const response = await materialsApi.createRequest(materialPayload(input, user));
          const normalizedRequest = normalizeMaterialRequestRecord(
            mapApiMaterialRequest(response.materialRequest),
            state.workers,
            state.projects
          );
          dispatch({ type: "ADD_MATERIAL_REQUEST", payload: normalizedRequest });
          return hydrateMaterialRequestRecord(normalizedRequest, workersById, projectsById);
        });
      },
      async deleteMaterialRequest(requestId) {
        return runMutation(async () => {
          await materialsApi.deleteRequest(requestId);
          dispatch({ type: "DELETE_MATERIAL_REQUEST", payload: { requestId } });
          return true;
        });
      },
      async updateMaterialRequestStatus(requestId, status) {
        return runMutation(async () => {
          if (user?.role !== "admin") throw new Error("Only admins can update material request status.");
          const response = await materialsApi.updateStatus(requestId, MATERIAL_STATUS_TO_API[status] ?? status);
          const normalizedRequest = normalizeMaterialRequestRecord(
            mapApiMaterialRequest(response.materialRequest),
            state.workers,
            state.projects
          );
          dispatch({
            type: "UPDATE_MATERIAL_REQUEST_STATUS",
            payload: {
              requestId,
              status: normalizedRequest.status
            }
          });
          return normalizedRequest.status;
        });
      },
      refreshData: loadBackendData,
      clearDataError: () => setDataError(""),
      getLastMutationError
    }),
    [getLastMutationError, loadBackendData, projectsById, runMutation, state.projects, state.tasks, state.workers, user, workersById]
  );

  const value = useMemo(
    () => ({
      attendance,
      tasks,
      threads: state.threads,
      workers,
      materialRequests,
      projects,
      finance: mockFinance,
      notifications,
      dismissNotification,
      isDataLoading,
      dataError,
      ...actions
    }),
    [actions, attendance, dataError, dismissNotification, isDataLoading, materialRequests, notifications, projects, state.threads, tasks, workers]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
