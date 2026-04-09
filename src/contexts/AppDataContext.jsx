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

function buildWorkerRecord(worker, currentWorker) {
  const assignedProject =
    worker.assignedProject?.trim() ||
    currentWorker?.assignedProject ||
    currentWorker?.location ||
    "Unassigned";
  const position = worker.position?.trim() || currentWorker?.position || currentWorker?.trade || "";

  return {
    id: currentWorker?.id ?? `worker-${Date.now()}`,
    name: worker.name.trim(),
    email: worker.email.trim(),
    phone: worker.phone.trim(),
    position,
    trade: position,
    assignedProject,
    location: assignedProject,
    status: worker.status?.trim() || currentWorker?.status || "On site",
    availability: worker.availability?.trim() || currentWorker?.availability || "Available",
    completionRate: currentWorker?.completionRate ?? 0,
    nextShift: currentWorker?.nextShift ?? "Not scheduled"
  };
}

export function AppDataProvider({ children }) {
  const [tasks, setTasks] = useState(mockTasks);
  const [threads, setThreads] = useState(mockThreads);
  const [workers, setWorkers] = useState(mockWorkers);

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

  const sendMessage = ({ threadId, senderId, text }) => {
    if (!text.trim()) {
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
                  timestamp
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
      toggleTaskStatus,
      sendMessage
    }),
    [tasks, threads, workers]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
