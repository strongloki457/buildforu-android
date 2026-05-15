import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/navigation/BottomNav";
import Sidebar from "../components/navigation/Sidebar";
import Topbar from "../components/navigation/Topbar";
import { getNavigation } from "../components/navigation/navConfig";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function AppLayout() {
  const { user } = useAuth();
  const { dataError, isDataLoading, notifications, refreshData } = useAppData();
  const { t } = useI18n();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = useMemo(() => getNavigation(user?.role, t), [user?.role, t]);
  const activeItem =
    navItems
      .filter((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))
      .sort((left, right) => right.path.length - left.path.length)[0] ?? navItems[0];

  return (
    <div className="mobile-safe-bottom min-h-screen px-2 py-2 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-1rem)] max-w-[1680px] gap-3 sm:gap-4 lg:min-h-[calc(100vh-2rem)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar
          navItems={navItems}
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="dashboard-grid min-w-0 rounded-[24px] border border-white/60 p-2 sm:rounded-[32px] sm:p-4">
          <Topbar
            navItems={navItems}
            pageTitle={activeItem?.label ?? t("nav.dashboard")}
            notifications={notifications}
            onMenuOpen={() => setSidebarOpen(true)}
          />

          {dataError ? (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <span className="break-anywhere">{dataError}</span>
              <button
                type="button"
                onClick={refreshData}
                className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-amber-900 shadow-sm"
              >
                {t("common.retry", "Retry")}
              </button>
            </div>
          ) : null}

          {isDataLoading ? (
            <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-slate-500">
              {t("common.loading", "Loading interface...")}
            </div>
          ) : null}

          <main className="mt-3 min-w-0 rounded-[22px] sm:mt-4 sm:rounded-[28px]">
            <Outlet />
          </main>
        </div>
      </div>
      <BottomNav navItems={navItems} />
    </div>
  );
}
