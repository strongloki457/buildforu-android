import { hydrateTaskRecord, normalizeTaskRecord } from "./tasks";

export function createTaskActions({ dispatch, projectsById, state, workersById }) {
  const addTask = (task) => {
    const normalizedTask = normalizeTaskRecord(task, state.workers, state.projects);

    if (!normalizedTask.title || !normalizedTask.date) {
      return null;
    }

    dispatch({
      type: "ADD_TASK",
      payload: normalizedTask
    });

    return hydrateTaskRecord(normalizedTask, workersById, projectsById);
  };

  const toggleTaskStatus = (taskId) => {
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
