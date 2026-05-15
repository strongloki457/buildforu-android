import { Building2, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useI18n } from "../../hooks/useI18n";
import logoFull from "../../assets/logo-full.svg";
import { getUserTitle } from "../../utils/localizedValue";

export default function Sidebar({ navItems, user, isOpen, onClose }) {
  const { t } = useI18n();

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm transition lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-40 flex h-dvh w-[88vw] max-w-[320px] flex-col overflow-y-auto border-r border-white/40 bg-slate-950/95 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white transition duration-300 sm:w-[300px] sm:p-6 lg:sticky lg:z-10 lg:h-full lg:w-full lg:max-w-none lg:translate-x-0 lg:rounded-[32px] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <img src={logoFull} alt={t("app.name")} className="h-10 w-auto sm:h-11" />
            <div>
              <p className="mt-2 pl-1 text-xs text-white/50">
                {user?.role === "admin" ? t("sidebar.controlTower") : t("sidebar.fieldWorkspace")}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="min-h-11 min-w-11 rounded-2xl bg-white/10 p-2 lg:hidden" aria-label={t("common.close")}>
            <X size={16} />
          </button>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-500/20 p-3 text-brand-300">
              <Building2 size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-white">{user?.companyName || t("app.name")}</p>
              <p className="text-xs text-white/50">
                {user?.role === "admin" ? t("sidebar.controlTower") : t("sidebar.fieldWorkspace")}
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-8 space-y-2 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3.5 text-sm transition ${
                    isActive
                      ? "bg-gradient-to-r from-brand-700 to-brand-500 text-white"
                      : "text-white/70 hover:bg-white/8 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">{t(`roles.${user?.role}`, user?.role)}</p>
          <p className="mt-3 text-lg">{user?.name}</p>
          <p className="text-sm text-white/55">{getUserTitle(t, user)}</p>
          {user?.email ? <p className="mt-4 text-sm text-white/50">{user.email}</p> : null}
        </div>
      </aside>
    </>
  );
}
