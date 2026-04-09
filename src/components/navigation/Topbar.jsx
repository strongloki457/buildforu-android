import { Bell, Menu, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import UserMenu from "./UserMenu";
import { useI18n } from "../../hooks/useI18n";

export default function Topbar({ navItems, pageTitle, notifications, onMenuOpen }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useI18n();

  return (
    <header className="glass-nav sticky top-4 z-20 rounded-[24px] p-3 sm:rounded-[28px] sm:p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onMenuOpen} className="rounded-2xl bg-slate-900 px-3 py-3 text-white lg:hidden" aria-label={t("common.openMenu")}>
            <Menu size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-brand-600">{t("common.welcomeBack")}</p>
            <h1 className="truncate text-xl text-slate-900 sm:text-2xl">{pageTitle}</h1>
          </div>

          <div className="relative hidden min-w-[220px] flex-1 md:block">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder={t("common.search")}
              className="w-full rounded-2xl border border-white/70 bg-white/80 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300"
            />
          </div>

          <LanguageSwitcher />

          <div className="relative">
            <button
              onClick={() => setShowNotifications((current) => !current)}
              className="relative rounded-2xl bg-white/80 p-3 text-slate-700 transition hover:bg-white"
              aria-label={t("common.notifications")}
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-brand-500" />
            </button>

            {showNotifications ? (
              <div className="absolute right-0 z-30 mt-3 w-72 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-soft backdrop-blur-xl">
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

        <div className="relative md:hidden">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder={t("common.search")}
            className="w-full rounded-2xl border border-white/70 bg-white/80 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300"
          />
        </div>

        <nav className="hidden gap-2 overflow-x-auto pb-1 lg:flex">
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
