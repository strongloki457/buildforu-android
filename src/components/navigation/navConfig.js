import {
  CalendarDays,
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
  materials: Package,
  calendar: CalendarDays,
  chat: MessageSquare,
  settings: Settings
};

const pathRegistry = {
  dashboard: "/dashboard"
};

const employeeItems = ["dashboard", "calendar", "materials", "chat", "settings"];
const adminItems = ["dashboard", "workers", "projects", "calendar", "materials", "chat", "settings"];

export function getNavigation(role, t) {
  const keys = role === "admin" ? adminItems : employeeItems;

  return keys.map((key) => ({
    key,
    label: t(`nav.${key}`, key),
    path: pathRegistry[key] ?? `/${key}`,
    icon: registry[key]
  }));
}
