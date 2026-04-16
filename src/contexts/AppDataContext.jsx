import { createContext, useEffect, useMemo, useReducer } from "react";
import { persistCoreAppData } from "../data/appDataStorage";
import { mockFinance } from "../data/mockFinance";
import { mockNotifications } from "../data/mockNotifications";
import { useAuth } from "../hooks/useAuth";
import { createAppDataActions } from "./appData/actions";
import { hydrateMaterialRequestRecord } from "./appData/materials";
import { appDataReducer, createInitialAppState } from "./appData/state";
import { hydrateTaskRecord } from "./appData/tasks";
import { hydrateWorkerRecord } from "./appData/workers";

export const AppDataContext = createContext(null);

function createLookup(items) {
  return new Map(items.map((item) => [item.id, item]));
}

function matchesWorkspaceScope(item, currentUser) {
  if (!currentUser) {
    return true;
  }

  const itemCompanyId = String(item?.companyId ?? "").trim();
  const itemWorkspaceId = String(item?.workspaceId ?? "").trim();
  const matchesCompany = !itemCompanyId || itemCompanyId === currentUser.companyId;
  const matchesWorkspace = !itemWorkspaceId || itemWorkspaceId === currentUser.workspaceId;

  return matchesCompany && matchesWorkspace;
}

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(appDataReducer, undefined, createInitialAppState);

  useEffect(() => {
    persistCoreAppData(state);
  }, [state.attendance, state.materialRequests, state.projects, state.tasks, state.workers]);

  const scopedState = useMemo(() => {
    const workers = state.workers.filter((worker) => matchesWorkspaceScope(worker, user));
    const workerIds = new Set(workers.map((worker) => worker.id));
    const projects = state.projects.filter((project) => matchesWorkspaceScope(project, user));
    const projectIds = new Set(projects.map((project) => project.id));
    const tasks = state.tasks.filter(
      (task) =>
        matchesWorkspaceScope(task, user) ||
        workerIds.has(task.employeeId) ||
        projectIds.has(task.projectId)
    );
    const materialRequests = state.materialRequests.filter(
      (request) =>
        matchesWorkspaceScope(request, user) ||
        workerIds.has(request.requestedById) ||
        projectIds.has(request.projectId)
    );
    const attendance = state.attendance.filter((record) => workerIds.has(record.workerId));

    return {
      ...state,
      attendance,
      materialRequests,
      projects,
      tasks,
      workers
    };
  }, [state, user]);

  const projectsById = useMemo(() => createLookup(scopedState.projects), [scopedState.projects]);
  const attendanceByWorkerId = useMemo(
    () => new Map(scopedState.attendance.map((record) => [record.workerId, record])),
    [scopedState.attendance]
  );

  const workers = useMemo(
    () => scopedState.workers.map((worker) => hydrateWorkerRecord(worker, projectsById, attendanceByWorkerId)),
    [attendanceByWorkerId, projectsById, scopedState.workers]
  );
  const workersById = useMemo(() => createLookup(workers), [workers]);

  const tasks = useMemo(
    () => scopedState.tasks.map((task) => hydrateTaskRecord(task, workersById, projectsById)),
    [projectsById, scopedState.tasks, workersById]
  );

  const projects = useMemo(
    () =>
      scopedState.projects.map((project) => ({
        ...project,
        assignedWorkers: workers.filter((worker) => worker.projectIds.includes(project.id)),
        taskCount: tasks.filter((task) => task.projectId === project.id).length,
        openTaskCount: tasks.filter((task) => task.projectId === project.id && task.status === "pending").length
      })),
    [scopedState.projects, tasks, workers]
  );

  const materialRequests = useMemo(
    () => scopedState.materialRequests.map((request) => hydrateMaterialRequestRecord(request, workersById, projectsById)),
    [projectsById, scopedState.materialRequests, workersById]
  );

  const attendance = useMemo(
    () =>
      scopedState.attendance.map((record) => ({
        ...record,
        worker: workersById.get(record.workerId) ?? null
      })),
    [scopedState.attendance, workersById]
  );

  const actions = useMemo(
    () =>
      createAppDataActions({
        attendanceByWorkerId,
        currentUser: user,
        dispatch,
        projectsById,
        state: scopedState,
        workersById
      }),
    [attendanceByWorkerId, projectsById, scopedState, user, workersById]
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
