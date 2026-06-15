import { ArrowLeftRight, ChevronDown, LogOut, UserCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useI18n } from "../../hooks/useI18n";
import { getUserTitle } from "../../utils/localizedValue";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { user, logout, switchRole } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSwitchRole = async (role) => {
    setIsSwitching(true);
    setOpen(false);
    try {
      await switchRole(role);
    } catch {
      // ignore — user stays in current role
    } finally {
      setIsSwitching(false);
    }
  };

  const isEmployeeMode = user?.role === "employee" && user?.canSwitchToAdmin;

  return (
    <div className="relative">
      {isEmployeeMode && (
        <div className="mb-1 flex items-center gap-1.5 rounded-2xl bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs text-amber-700">
          <ArrowLeftRight size={11} />
          Tryb pracownika
        </div>
      )}
      <button
        className="flex min-h-11 items-center gap-2 rounded-2xl bg-white/80 px-2.5 py-2 transition hover:bg-white sm:gap-3 sm:px-3"
        onClick={() => setOpen((current) => !current)}
        disabled={isSwitching}
      >
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 text-sm text-white">
          {user?.avatarUrl
            ? <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            : user?.avatar}
        </div>
        <div className="hidden text-left lg:block">
          <p className="text-sm text-slate-900">{user?.name}</p>
          <p className="text-xs text-slate-500">
            {[getUserTitle(t, user), user?.companyName].filter(Boolean).join(" - ")}
          </p>
        </div>
        <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-3 w-[min(16rem,calc(100vw-1.5rem))] rounded-3xl border border-white/70 bg-white/95 p-3 shadow-soft backdrop-blur-xl">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="break-anywhere text-sm text-slate-900">{user?.email}</p>
            {user?.companyName ? <p className="mt-1 text-xs text-slate-500">{user.companyName}</p> : null}
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-600">{t(`roles.${user?.role}`, user?.role)}</p>
          </div>

          {user?.canSwitchToEmployee && (
            <button
              onClick={() => handleSwitchRole("EMPLOYEE")}
              disabled={isSwitching}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <ArrowLeftRight size={16} />
              Przełącz na konto pracownika
            </button>
          )}

          {user?.canSwitchToAdmin && (
            <button
              onClick={() => handleSwitchRole("ADMIN")}
              disabled={isSwitching}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
            >
              <ArrowLeftRight size={16} />
              Wróć do panelu admina
            </button>
          )}

          <button
            onClick={() => { setOpen(false); navigate("/settings"); }}
            className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-50"
          >
            <UserCircle size={16} />
            {t("common.account")}
          </button>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={16} />
            {t("common.logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
