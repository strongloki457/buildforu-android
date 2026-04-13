export function formatRequestDate(value, locale) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
