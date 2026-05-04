import { hydrateTaskRecord, normalizeTaskRecord } from "./tasks";

function applyWorkspaceScope(payload, currentUser) {
  return {
    ...payload,
    companyId: payload.companyId ?? currentUser?.companyId,
    workspaceId: payload.workspaceId ?? currentUser?.workspaceId
  };
}

export function createTaskActions({ currentUser, dispatch, projectsById, state, workersById }) {
  const addTask = (task) => {
    if (currentUser?.role && currentUser.role !== "admin") {
      return null;
    }

    const normalizedTask = normalizeTaskRecord(applyWorkspaceScope(task, currentUser), state.workers, state.projects);

    if (!normalizedTask.title || !normalizedTask.date || !normalizedTask.employeeId || !normalizedTask.projectId) {
      return null;
    }

    dispatch({
      type: "ADD_TASK",
      payload: normalizedTask
    });

    return hydrateTaskRecord(normalizedTask, workersById, projectsById);
  };

  const toggleTaskStatus = (taskId) => {
    if (currentUser?.role === "employee") {
      const task = state.tasks.find((item) => item.id === taskId);

      if (!task || task.employeeId !== currentUser.workerId) {
        return null;
      }
    }

    dispatch({
      type: "TOGGLE_TASK_STATUS",
      payload: { taskId }
    });
  };

  return {
    addTask,
    toggleTaskStatus
  };
}
