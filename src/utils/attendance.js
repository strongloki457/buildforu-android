export function formatAttendanceDateTime(value, locale = "en") {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }
}

export function hasAttendanceLocation(location) {
  return Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude);
}

export function formatAttendanceCoordinates(location) {
  if (!hasAttendanceLocation(location)) {
    return null;
  }

  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}
