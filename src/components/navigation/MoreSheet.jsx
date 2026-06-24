import { LogOut, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useI18n } from "../../hooks/useI18n";
import { getUserTitle } from "../../utils/localizedValue";
import LanguageSwitcher from "./LanguageSwitcher";

export default function MoreSheet({ open, onClose, items }) {
  const { user, logout } = useAuth();
  const { t } = useI18n();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/30 transition ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_-20px_rgba(15,23,42,0.35)] transition duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg text-slate-950">{t("common.more", "More")}</h2>
          <button onClick={onClose} className="min-h-10 min-w-10 rounded-2xl bg-slate-100 p-2" aria-label={t("common.close")}>
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 text-sm text-white">
            {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" /> : user?.avatar}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{getUserTitle(t, user)}</p>
          </div>
        </div>

        <nav className="mt-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-12 items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
          <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{t("common.language")}</span>
          <LanguageSwitcher />
        </div>

        <button
          onClick={logout}
          className="mt-3 flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-rose-600 transition hover:bg-rose-50"
        >
          <LogOut size={18} />
          {t("common.logout")}
        </button>
      </div>
    </>
  );
}
