import {
  CalendarDays,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  Map,
  MessageSquare,
  Package,
  Settings,
  Users2,
  Wallet
} from "lucide-react";

const registry = {
  dashboard: LayoutDashboard,
  workers: Users2,
  marketMap: Map,
  projects: FolderKanban,
  materials: Package,
  calendar: CalendarDays,
  finance: Wallet,
  tasks: ClipboardList,
  chat: MessageSquare,
  settings: Settings
};

const pathRegistry = {
  dashboard: "/dashboard",
  marketMap: "/market-map"
};

const fallbackLabels = {
  marketMap: "Market Map"
};

const employeeItems = ["dashboard", "calendar", "tasks", "materials", "marketMap", "chat", "settings"];
const adminItems = [
  "dashboard",
  "workers",
  "marketMap",
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
    label: t(`nav.${key}`, fallbackLabels[key] ?? key),
    path: pathRegistry[key] ?? `/${key}`,
    icon: registry[key]
  }));
}
