export function getLocalDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function sortByDateKey(items, getValue = (item) => item.date) {
  return [...items].sort((left, right) =>
    String(getValue(left) ?? "").localeCompare(String(getValue(right) ?? ""))
  );
}

export function getUpcomingItemsByDate(items, getValue = (item) => item.date, referenceDate = getLocalDateKey()) {
  return sortByDateKey(items, getValue).filter((item) => String(getValue(item) ?? "") >= referenceDate);
}

export function isDateKeyInMonth(dateKey, referenceDate) {
  const value = String(dateKey ?? "");
  const [year, month] = value.split("-").map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return false;
  }

  return year === referenceDate.getFullYear() && month === referenceDate.getMonth() + 1;
}
