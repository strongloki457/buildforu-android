import {
  Bot,
  CalendarDays,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Timer,
  Users2,
  Wallet
} from "lucide-react";

const registry = {
  dashboard: LayoutDashboard,
  workers: Users2,
  projects: FolderKanban,
  tasks: ClipboardList,
  materials: Package,
  calendar: CalendarDays,
  chat: MessageSquare,
  "ai-assistant": Bot,
  "attendance-reports": Timer,
  finance: Wallet,
  settings: Settings
};

const pathRegistry = {
  dashboard: "/dashboard"
};

const employeeItems = ["dashboard", "tasks", "calendar", "materials", "chat", "ai-assistant", "settings"];
const adminItems = ["dashboard", "workers", "attendance-reports", "projects", "calendar", "materials", "chat", "ai-assistant", "finance", "settings"];

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

export function getNavigation(role, t) {
  const keys = normalizeRole(role) === "admin" ? adminItems : employeeItems;

  return keys.map((key) => ({
    key,
    label: t(`nav.${key}`, key),
    path: pathRegistry[key] ?? `/${key}`,
    icon: registry[key]
  }));
}

const mobilePrimaryKeys = {
  admin: ["dashboard", "projects", "workers", "chat"],
  employee: ["dashboard", "tasks", "calendar", "chat"]
};

export function getMobileNavigation(role, t) {
  const items = getNavigation(role, t);
  const primaryKeys = normalizeRole(role) === "admin" ? mobilePrimaryKeys.admin : mobilePrimaryKeys.employee;

  const primary = primaryKeys
    .map((key) => items.find((item) => item.key === key))
    .filter(Boolean);
  const more = items.filter((item) => !primaryKeys.includes(item.key));

  return { primary, more };
}
