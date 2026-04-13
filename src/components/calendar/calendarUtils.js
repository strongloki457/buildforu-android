import { getLocalDateKey } from "../../utils/date";

export function getCalendarCells(tasks, referenceDate) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < offset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const dateKey = getLocalDateKey(new Date(year, month, day));
    const matches = tasks.filter((task) => task.date === dateKey);

    cells.push({
      day,
      dateKey,
      matches
    });
  }

  return cells;
}

export function formatMonthLabel(date, locale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    month: "long",
    year: "numeric"
  }).format(date);
}

export function getWeekdayLabels(locale) {
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, { weekday: "short" }).format(
      new Date(Date.UTC(2026, 0, 5 + index))
    )
  );
}
