import { createContext, useEffect, useMemo, useReducer } from "react";
import { persistCoreAppData } from "../data/appDataStorage";
import { mockFinance } from "../data/mockFinance";
import { mockNotifications } from "../data/mockNotifications";
import { createAppDataActions } from "./appData/actions";
import { hydrateMaterialRequestRecord } from "./appData/materials";
import { appDataReducer, createInitialAppState } from "./appData/state";
import { hydrateTaskRecord } from "./appData/tasks";
import { hydrateWorkerRecord } from "./appData/workers";

export const AppDataContext = createContext(null);

function createLookup(items) {
  return new Map(items.map((item) => [item.id, item]));
}

export function AppDataProvider({ children }) {
  const [state, dispatch] = useReducer(appDataReducer, undefined, createInitialAppState);

  useEffect(() => {
    persistCoreAppData(state);
  }, [state.attendance, state.materialRequests, state.projects, state.tasks, state.workers]);

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

  const actions = useMemo(
    () =>
      createAppDataActions({
        attendanceByWorkerId,
        dispatch,
        projectsById,
        state,
        workersById
      }),
    [attendanceByWorkerId, projectsById, state, workersById]
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
      notifications: mockNotifications,
      ...actions
    }),
    [actions, attendance, materialRequests, projects, state.threads, tasks, workers]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
