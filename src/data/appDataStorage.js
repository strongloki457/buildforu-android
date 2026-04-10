const STORAGE_KEY = "buildforu-core-data";

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function pickPersistedSlice(state) {
  return {
    attendance: state.attendance,
    materialRequests: state.materialRequests,
    projects: state.projects,
    tasks: state.tasks,
    workers: state.workers
  };
}

export function loadStoredCoreAppData(fallbackState) {
  if (typeof window === "undefined") {
    return cloneValue(fallbackState);
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return cloneValue(fallbackState);
    }

    const parsedValue = JSON.parse(rawValue);

    return {
      attendance: Array.isArray(parsedValue?.attendance) ? parsedValue.attendance : cloneValue(fallbackState.attendance),
      materialRequests: Array.isArray(parsedValue?.materialRequests)
        ? parsedValue.materialRequests
        : cloneValue(fallbackState.materialRequests),
      projects: Array.isArray(parsedValue?.projects) ? parsedValue.projects : cloneValue(fallbackState.projects),
      tasks: Array.isArray(parsedValue?.tasks) ? parsedValue.tasks : cloneValue(fallbackState.tasks),
      workers: Array.isArray(parsedValue?.workers) ? parsedValue.workers : cloneValue(fallbackState.workers)
    };
  } catch {
    return cloneValue(fallbackState);
  }
}

export function persistCoreAppData(state) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pickPersistedSlice(state)));
}
