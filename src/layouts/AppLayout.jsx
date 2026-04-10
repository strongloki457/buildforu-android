import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import Topbar from "../components/navigation/Topbar";
import { getNavigation } from "../components/navigation/navConfig";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function AppLayout() {
  const { user } = useAuth();
  const { notifications } = useAppData();
  const { t } = useI18n();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = useMemo(() => getNavigation(user?.role, t), [user?.role, t]);
  const activeItem =
    navItems
      .filter((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))
      .sort((left, right) => right.path.length - left.path.length)[0] ?? navItems[0];

  return (
    <div className="min-h-screen px-4 py-4 lg:px-5 lg:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1680px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar
          navItems={navItems}
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="dashboard-grid rounded-[32px] border border-white/60 p-3 sm:p-4">
          <Topbar
            navItems={navItems}
            pageTitle={activeItem?.label ?? t("nav.dashboard")}
            notifications={notifications}
            onMenuOpen={() => setSidebarOpen(true)}
          />

          <main className="mt-4 rounded-[28px]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
