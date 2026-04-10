import { createContext, useMemo, useState } from "react";
import {
  mockFinance,
  mockMaterialRequests,
  mockNotifications,
  mockProjects,
  mockTasks,
  mockThreads,
  mockWorkers
} from "../data/mockData";

export const AppDataContext = createContext(null);

function createEntityId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasOwnProperty(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function normalizeAttendanceStatus(value) {
  const normalizedValue = String(value ?? "")
    .trim()
    .toLowerCase();

  if (normalizedValue === "on site") {
    return "On Site";
  }

  if (normalizedValue === "off site" || normalizedValue === "off shift" || normalizedValue === "in transit") {
    return "Off Site";
  }

  return "Off Site";
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
    text: typeof location.text === "string" ? location.text.trim() : ""
  };
}

function buildAttendanceRecord(worker, currentAttendance) {
  return {
    currentStatus: normalizeAttendanceStatus(
      worker.currentStatus ?? worker.attendance?.currentStatus ?? worker.status ?? currentAttendance?.currentStatus
    ),
    workStartTime:
      worker.workStartTime ?? worker.attendance?.workStartTime ?? currentAttendance?.workStartTime ?? null,
    workEndTime: worker.workEndTime ?? worker.attendance?.workEndTime ?? currentAttendance?.workEndTime ?? null,
    workStartLocation: normalizeLocation(
      worker.workStartLocation ?? worker.attendance?.workStartLocation ?? currentAttendance?.workStartLocation
    ),
    workEndLocation: normalizeLocation(
      worker.workEndLocation ?? worker.attendance?.workEndLocation ?? currentAttendance?.workEndLocation
    )
  };
}

function buildWorkerRecord(worker, currentWorker) {
  const name = hasOwnProperty(worker, "name") ? String(worker.name ?? "").trim() : currentWorker?.name ?? "";
  const email = hasOwnProperty(worker, "email") ? String(worker.email ?? "").trim() : currentWorker?.email ?? "";
  const phone = hasOwnProperty(worker, "phone") ? String(worker.phone ?? "").trim() : currentWorker?.phone ?? "";
  const position = hasOwnProperty(worker, "position")
    ? String(worker.position ?? "").trim()
    : currentWorker?.position ?? currentWorker?.trade ?? "";
  const assignedProject = hasOwnProperty(worker, "assignedProject")
    ? String(worker.assignedProject ?? "").trim()
    : currentWorker?.assignedProject ?? currentWorker?.location ?? "";
  const attendance = buildAttendanceRecord(worker, currentWorker?.attendance);
  const positionKey = hasOwnProperty(worker, "position")
    ? null
    : worker.positionKey ?? worker.tradeKey ?? currentWorker?.positionKey ?? currentWorker?.tradeKey ?? null;
  const assignedProjectKey = hasOwnProperty(worker, "assignedProject")
    ? null
    : worker.assignedProjectKey ?? worker.locationKey ?? currentWorker?.assignedProjectKey ?? currentWorker?.locationKey ?? null;

  return {
    id: currentWorker?.id ?? createEntityId("worker"),
    name: name || currentWorker?.name || "",
    email,
    phone,
    position,
    positionKey,
    trade: position,
    tradeKey: positionKey,
    assignedProject,
    assignedProjectKey,
    location: assignedProject,
    locationKey: assignedProjectKey,
    status: attendance.currentStatus,
    availability: hasOwnProperty(worker, "availability")
      ? String(worker.availability ?? "").trim() || "Available"
      : currentWorker?.availability || "Available",
    completionRate: currentWorker?.completionRate ?? 0,
    nextShift: currentWorker?.nextShift ?? "Not scheduled",
    attendance
  };
}

export function AppDataProvider({ children }) {
  const [tasks, setTasks] = useState(mockTasks);
  const [threads, setThreads] = useState(mockThreads);
  const [workers, setWorkers] = useState(() => mockWorkers.map((worker) => buildWorkerRecord(worker)));
  const [materialRequests, setMaterialRequests] = useState(mockMaterialRequests);

  const addTask = ({ employeeId, assignee, title, location, date }) => {
    const normalizedTitle = String(title ?? "").trim();
    const normalizedLocation = String(location ?? "").trim();

    if (!employeeId || !normalizedTitle || !normalizedLocation || !date) {
      return null;
    }

    const newTask = {
      id: createEntityId("task"),
      employeeId,
      assignee,
      title: normalizedTitle,
      location: normalizedLocation,
      date,
      status: "pending",
      priority: "medium"
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    return newTask;
  };

  const toggleTaskStatus = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === "completed" ? "pending" : "completed"
            }
          : task
      )
    );
  };

  const sendMessage = ({ threadId, senderId, text, attachments = [] }) => {
    if (!text.trim() && !attachments.length) {
      return;
    }

    const timestamp = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());

    setThreads((currentThreads) =>
      currentThreads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              messages: [
                ...thread.messages,
                {
                  id: createEntityId("m"),
                  senderId,
                  text: text.trim(),
                  timestamp,
                  attachments
                }
              ]
            }
          : thread
      )
    );
  };

  const addWorker = (worker) => {
    const newWorker = buildWorkerRecord(worker);
    setWorkers((currentWorkers) => [newWorker, ...currentWorkers]);
    return newWorker;
  };

  const updateWorker = (workerId, updates) => {
    let updatedWorker = null;

    setWorkers((currentWorkers) =>
      currentWorkers.map((worker) => {
        if (worker.id !== workerId) {
          return worker;
        }

        updatedWorker = buildWorkerRecord(updates, worker);
        return updatedWorker;
      })
    );

    return updatedWorker;
  };

  const deleteWorker = (workerId) => {
    setWorkers((currentWorkers) => currentWorkers.filter((worker) => worker.id !== workerId));
  };

  const addMaterialRequest = ({ itemName, quantity = "", note = "", requestedById, requestedBy, projectName = "" }) => {
    const normalizedItemName = String(itemName ?? "").trim();
    const normalizedQuantity = String(quantity ?? "").trim();
    const normalizedNote = String(note ?? "").trim();
    const normalizedProjectName = String(projectName ?? "").trim();

    if (!normalizedItemName || !requestedById || !requestedBy) {
      return null;
    }

    const newRequest = {
      id: createEntityId("request"),
      itemName: normalizedItemName,
      quantity: normalizedQuantity,
      note: normalizedNote,
      status: "Pending",
      requestedById,
      requestedBy,
      projectName: normalizedProjectName,
      createdAt: new Date().toISOString()
    };

    setMaterialRequests((currentRequests) => [newRequest, ...currentRequests]);
    return newRequest;
  };

  const updateMaterialRequestStatus = (requestId, status) => {
    const normalizedStatus = String(status ?? "").trim();
    let updatedRequest = null;

    if (!normalizedStatus) {
      return null;
    }

    setMaterialRequests((currentRequests) =>
      currentRequests.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        updatedRequest = {
          ...request,
          status: normalizedStatus
        };

        return updatedRequest;
      })
    );

    return updatedRequest;
  };

  const startWork = (workerId, options = {}) => {
    let updatedWorker = null;
    const timestamp = options.timestamp ?? new Date().toISOString();
    const location = normalizeLocation(options.location);

    setWorkers((currentWorkers) =>
      currentWorkers.map((worker) => {
        if (worker.id !== workerId) {
          return worker;
        }

        updatedWorker = {
          ...worker,
          status: "On Site",
          attendance: {
            ...worker.attendance,
            currentStatus: "On Site",
            workStartTime: timestamp,
            workEndTime: null,
            workStartLocation: location,
            workEndLocation: null
          }
        };

        return updatedWorker;
      })
    );

    return updatedWorker;
  };

  const endWork = (workerId, options = {}) => {
    let updatedWorker = null;
    const timestamp = options.timestamp ?? new Date().toISOString();
    const location = normalizeLocation(options.location);

    setWorkers((currentWorkers) =>
      currentWorkers.map((worker) => {
        if (worker.id !== workerId) {
          return worker;
        }

        updatedWorker = {
          ...worker,
          status: "Off Site",
          attendance: {
            ...worker.attendance,
            currentStatus: "Off Site",
            workEndTime: timestamp,
            workEndLocation: location
          }
        };

        return updatedWorker;
      })
    );

    return updatedWorker;
  };

  const value = useMemo(
    () => ({
      tasks,
      threads,
      workers,
      materialRequests,
      projects: mockProjects,
      finance: mockFinance,
      notifications: mockNotifications,
      addTask,
      addWorker,
      updateWorker,
      deleteWorker,
      addMaterialRequest,
      updateMaterialRequestStatus,
      startWork,
      endWork,
      toggleTaskStatus,
      sendMessage
    }),
    [tasks, threads, workers, materialRequests]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
