import { Capacitor } from "@capacitor/core";
import { MailWarning, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { apiRequest } from "../api/client";
import BottomTabBar from "../components/navigation/BottomTabBar";
import MoreSheet from "../components/navigation/MoreSheet";
import Sidebar from "../components/navigation/Sidebar";
import Topbar from "../components/navigation/Topbar";
import { getMobileNavigation, getNavigation } from "../components/navigation/navConfig";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { usePushNotifications } from "../hooks/usePushNotifications";

const isNativeApp = Capacitor.isNativePlatform();

export default function AppLayout() {
  const { user } = useAuth();
  usePushNotifications(Boolean(user));
  const { dataError, isDataLoading, notifications, dismissNotification, refreshData } = useAppData();
  const { t } = useI18n();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [verifyBannerDismissed, setVerifyBannerDismissed] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const showVerifyBanner = !verifyBannerDismissed && user && user.emailVerified === false;

  const handleResend = async () => {
    try {
      await apiRequest("/api/auth/resend-verification", { method: "POST" });
      setResendSent(true);
    } catch {
      // ignore
    }
  };

  const navItems = useMemo(() => getNavigation(user?.role, t), [user?.role, t]);
  const { primary: mobilePrimaryItems, more: mobileMoreItems } = useMemo(
    () => getMobileNavigation(user?.role, t),
    [user?.role, t]
  );
  const activeItem =
    navItems
      .filter((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))
      .sort((left, right) => right.path.length - left.path.length)[0] ?? navItems[0];
  const isMoreActive = mobileMoreItems.some((item) => activeItem?.key === item.key);

  if (isNativeApp) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f4f7f3]">
        <div className="px-3 pt-3">
          <Topbar
            navItems={navItems}
            pageTitle={activeItem?.label ?? t("nav.dashboard")}
            notifications={notifications}
            onDismissNotification={dismissNotification}
            hideMenuButton
          />

          {showVerifyBanner && (
            <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <div className="flex items-center gap-2">
                <MailWarning size={16} className="shrink-0 text-amber-600" />
                <span>{resendSent ? t("emailVerify.resentBanner") : t("emailVerify.banner")}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {!resendSent && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-amber-900 shadow-sm hover:bg-amber-100 transition"
                  >
                    {t("emailVerify.resend")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setVerifyBannerDismissed(true)}
                  className="text-amber-600 hover:text-amber-800 transition"
                  aria-label={t("common.close")}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {dataError ? (
            <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
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
            <div className="mt-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-slate-500">
              {t("common.loading", "Loading interface...")}
            </div>
          ) : null}
        </div>

        <main className="min-w-0 flex-1 px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-3">
          <Outlet />
        </main>

        <BottomTabBar items={mobilePrimaryItems} onMoreClick={() => setMoreOpen(true)} isMoreActive={isMoreActive} />
        <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} items={mobileMoreItems} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2 py-2 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
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
            onDismissNotification={dismissNotification}
            onMenuOpen={() => setSidebarOpen(true)}
          />

          {showVerifyBanner && (
            <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <MailWarning size={16} className="shrink-0 text-amber-600" />
                <span>
                  {resendSent ? t("emailVerify.resentBanner") : t("emailVerify.banner")}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {!resendSent && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-amber-900 shadow-sm hover:bg-amber-100 transition"
                  >
                    {t("emailVerify.resend")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setVerifyBannerDismissed(true)}
                  className="text-amber-600 hover:text-amber-800 transition"
                  aria-label={t("common.close")}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

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
    </div>
  );
}
