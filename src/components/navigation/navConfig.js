import {
  Bot,
  CalendarDays,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Users2
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
  settings: Settings
};

const pathRegistry = {
  dashboard: "/dashboard"
};

const employeeItems = ["dashboard", "tasks", "calendar", "materials", "chat", "ai-assistant", "settings"];
const adminItems = ["dashboard", "workers", "projects", "calendar", "materials", "chat", "ai-assistant", "settings"];

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
