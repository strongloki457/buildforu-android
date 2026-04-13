const STORAGE_KEY = "buildforu-core-data";
const CORE_DATA_KEYS = ["attendance", "materialRequests", "projects", "tasks", "workers"];

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function pickPersistedSlice(state) {
  return CORE_DATA_KEYS.reduce(
    (slice, key) => ({
      ...slice,
      [key]: state[key]
    }),
    {}
  );
}

function resolveStoredCollection(parsedValue, fallbackState, key) {
  const storedValue = key === "materialRequests" ? parsedValue?.materialRequests ?? parsedValue?.materials : parsedValue?.[key];
  return Array.isArray(storedValue) ? storedValue : cloneValue(fallbackState[key]);
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

    return CORE_DATA_KEYS.reduce(
      (state, key) => ({
        ...state,
        [key]: resolveStoredCollection(parsedValue, fallbackState, key)
      }),
      {}
    );
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
