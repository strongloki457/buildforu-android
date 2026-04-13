export function formatProjectDate(value, locale) {
  if (!value) {
    return "-";
  }

  const [year, month, day] = String(value).split("-").map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    dateStyle: "medium"
  }).format(new Date(year, month - 1, day));
}
