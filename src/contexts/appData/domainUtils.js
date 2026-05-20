export function hasOwnProperty(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function normalizeText(value) {
  return String(value ?? "").trim();
}

export function normalizeOptionValue(value, options, fallback) {
  const normalizedValue = normalizeText(value);
  const match = options.find((option) => option.toLowerCase() === normalizedValue.toLowerCase());
  return match ?? fallback;
}

export function normalizeLocation(location) {
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
    accuracy: Number.isFinite(Number(location.accuracy)) ? Number(location.accuracy) : undefined,
    text: normalizeText(location.text)
  };
}

export function clampProgress(value, fallback = 0) {
  const normalizedValue = Number(value);

  if (!Number.isFinite(normalizedValue)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, Math.round(normalizedValue)));
}

export function resolveProjectId(value, projects) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return "";
  }

  const exactMatch = projects.find((project) => project.id === normalizedValue);

  if (exactMatch) {
    return exactMatch.id;
  }

  const nameMatch = projects.find((project) => project.name.toLowerCase() === normalizedValue.toLowerCase());
  return nameMatch?.id ?? "";
}

export function sanitizeProjectIds(values, projects) {
  const items = Array.isArray(values) ? values : [values];
  const projectIds = items.map((value) => resolveProjectId(value, projects)).filter(Boolean);
  return Array.from(new Set(projectIds));
}
