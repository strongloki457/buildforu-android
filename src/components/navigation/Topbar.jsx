import { Bell, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import UserMenu from "./UserMenu";
import { useI18n } from "../../hooks/useI18n";

export default function Topbar({ navItems, pageTitle, notifications, onMenuOpen }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useI18n();

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

          <div className="relative">
            <button
              onClick={() => setShowNotifications((current) => !current)}
              className="relative min-h-11 min-w-11 rounded-2xl bg-white/80 p-3 text-slate-700 transition hover:bg-white"
              aria-label={t("common.notifications")}
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-brand-500" />
            </button>

            {showNotifications ? (
              <div className="absolute right-0 z-30 mt-3 max-h-[60vh] w-[min(18rem,calc(100vw-1.5rem))] overflow-y-auto rounded-3xl border border-white/70 bg-white/95 p-4 shadow-soft backdrop-blur-xl">
                <p className="text-sm text-slate-900">{t("common.notifications")}</p>
                <div className="mt-4 space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-sm text-slate-800">{t(notification.titleKey, notification.title)}</p>
                      <p className="mt-1 text-xs text-slate-400">{t(notification.timeKey, notification.time)}</p>
                    </div>
                  ))}
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
