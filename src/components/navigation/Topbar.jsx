import { Bell, BellOff, ChevronRight, Menu } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import UserMenu from "./UserMenu";
import { useI18n } from "../../hooks/useI18n";

const NOTIFICATION_ICONS = {
  material: "📦",
  task: "✅",
  attendance: "📍",
  chat: "💬",
  project: "🏗️"
};

const NOTIFICATION_LINKS = {
  material: "/materials",
  task: "/calendar",
  attendance: "/attendance-reports",
  chat: "/chat",
  project: "/projects"
};

export default function Topbar({ navItems, pageTitle, notifications, onMenuOpen }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();
  const dropdownRef = useRef(null);
  const unreadCount = notifications.length;

  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  return (
    <header className="glass-nav sticky top-2 z-20 rounded-[20px] p-2.5 sm:top-4 sm:rounded-[28px] sm:p-4">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <button onClick={onMenuOpen} className="min-h-11 min-w-11 rounded-2xl bg-slate-900 p-3 text-white lg:hidden" aria-label={t("common.openMenu")}>
            <Menu size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="hidden text-xs uppercase tracking-[0.2em] text-brand-600 sm:block sm:tracking-[0.25em]">{t("common.welcomeBack")}</p>
            <h1 className="truncate text-lg text-slate-900 sm:text-2xl">{pageTitle}</h1>
          </div>

          <LanguageSwitcher />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications((current) => !current)}
              className="relative min-h-11 min-w-11 rounded-2xl bg-white/80 p-3 text-slate-700 transition hover:bg-white"
              aria-label={t("common.notifications")}
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-medium text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>

            {showNotifications ? (
              <div className="absolute right-0 z-30 mt-3 w-[min(20rem,calc(100vw-1.5rem))] rounded-3xl border border-white/70 bg-white/95 shadow-soft backdrop-blur-xl">
                <div className="border-b border-slate-100 px-4 pt-4 pb-3">
                  <p className="text-sm font-medium text-slate-900">{t("common.notifications")}</p>
                </div>
                <div className="max-h-[50vh] overflow-y-auto">
                  {notifications.length ? (
                    <div className="space-y-1 p-2">
                      {notifications.map((notification) => {
                        const link = notification.link ?? NOTIFICATION_LINKS[notification.type];
                        const inner = (
                          <>
                            <span className="mt-0.5 text-base leading-none">{NOTIFICATION_ICONS[notification.type] ?? "🔔"}</span>
                            <div className="min-w-0 flex-1">
                              <p className="break-anywhere text-sm text-slate-800">{t(notification.titleKey, notification.title)}</p>
                              <p className="mt-0.5 text-xs text-slate-400">{t(notification.timeKey, notification.time)}</p>
                            </div>
                            {link && <ChevronRight size={14} className="mt-0.5 shrink-0 text-slate-300" />}
                          </>
                        );

                        if (link) {
                          return (
                            <button
                              key={notification.id}
                              type="button"
                              onClick={() => {
                                setShowNotifications(false);
                                navigate(link);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-brand-50"
                            >
                              {inner}
                            </button>
                          );
                        }

                        return (
                          <div key={notification.id} className="flex items-start gap-3 rounded-2xl px-3 py-3 hover:bg-slate-50">
                            {inner}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                      <BellOff size={22} className="text-slate-300" />
                      <p className="text-sm text-slate-400">{t("notifications.empty", "All caught up — no new alerts.")}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <UserMenu />
        </div>

        <nav className="touch-scroll hidden gap-2 overflow-x-auto pb-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-2 text-sm transition ${
                  isActive
                    ? "bg-gradient-to-r from-brand-700 to-brand-500 text-white shadow-lg shadow-brand-900/20"
                    : "bg-white/70 text-slate-600 hover:bg-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
