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

export function AppDataProvider({ children }) {
  const [tasks, setTasks] = useState(mockTasks);
  const [threads, setThreads] = useState(mockThreads);

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

  const value = useMemo(
    () => ({
      tasks,
      threads,
      workers: mockWorkers,
      projects: mockProjects,
      materials: mockMaterials,
      finance: mockFinance,
      notifications: mockNotifications,
      addTask,
      toggleTaskStatus,
      sendMessage
    }),
    [tasks, threads]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
