import {
  CalendarDays,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Users2,
  Wallet
} from "lucide-react";

const registry = {
  dashboard: LayoutDashboard,
  workers: Users2,
  projects: FolderKanban,
  materials: Package,
  calendar: CalendarDays,
  finance: Wallet,
  tasks: ClipboardList,
  chat: MessageSquare,
  settings: Settings
};

const employeeItems = ["dashboard", "calendar", "tasks", "chat", "settings"];
const adminItems = [
  "dashboard",
  "workers",
  "projects",
  "calendar",
  "materials",
  "finance",
  "chat",
  "settings"
];

export function getNavigation(role, t) {
  const keys = role === "admin" ? adminItems : employeeItems;

  return keys.map((key) => ({
    key,
    label: t(`nav.${key}`),
    path: key === "dashboard" ? "/dashboard" : `/${key}`,
    icon: registry[key]
  }));
}
