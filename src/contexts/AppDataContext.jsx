import { createContext, useMemo, useState } from "react";
import {
  mockFinance,
  mockMaterials,
  mockNotifications,
  mockProjects,
  mockTasks,
  mockThreads,
  mockWorkers
} from "../data/mockData";

export const AppDataContext = createContext(null);

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
  const assignedProject =
    worker.assignedProject?.trim() ||
    currentWorker?.assignedProject ||
    currentWorker?.location ||
    "";
  const position = worker.position?.trim() || currentWorker?.position || currentWorker?.trade || "";
  const attendance = buildAttendanceRecord(worker, currentWorker?.attendance);

  return {
    id: currentWorker?.id ?? `worker-${Date.now()}`,
    name: worker.name.trim(),
    email: worker.email?.trim() || currentWorker?.email || "",
    phone: worker.phone?.trim() || currentWorker?.phone || "",
    position,
    trade: position,
    assignedProject,
    location: assignedProject,
    status: attendance.currentStatus,
    availability: worker.availability?.trim() || currentWorker?.availability || "Available",
    completionRate: currentWorker?.completionRate ?? 0,
    nextShift: currentWorker?.nextShift ?? "Not scheduled",
    attendance
  };
}

export function AppDataProvider({ children }) {
  const [tasks, setTasks] = useState(mockTasks);
  const [threads, setThreads] = useState(mockThreads);
  const [workers, setWorkers] = useState(() => mockWorkers.map((worker) => buildWorkerRecord(worker)));

  const addTask = ({ employeeId, assignee, title, location, date }) => {
    const newTask = {
      id: `task-${Date.now()}`,
      employeeId,
      assignee,
      title,
      location,
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
                  id: `m-${Date.now()}`,
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
      projects: mockProjects,
      materials: mockMaterials,
      finance: mockFinance,
      notifications: mockNotifications,
      addTask,
      addWorker,
      updateWorker,
      deleteWorker,
      startWork,
      endWork,
      toggleTaskStatus,
      sendMessage
    }),
    [tasks, threads, workers]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
