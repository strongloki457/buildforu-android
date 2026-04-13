export function sanitizeCompanyName(value) {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "trial";
}

export function normalizePlan(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  if (normalized === "starter") {
    return "starter";
  }

  if (normalized === "enterprise") {
    return "enterprise";
  }

  return "pro";
}
