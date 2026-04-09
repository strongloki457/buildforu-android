import { Sparkles, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import logoMark from "../../assets/logo-mark.svg";

export default function Sidebar({ navItems, user, isOpen, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm transition lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-[300px] flex-col border-r border-white/40 bg-slate-950/90 p-6 text-white transition duration-300 lg:sticky lg:z-10 lg:w-full lg:translate-x-0 lg:rounded-[32px] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoMark} alt="BuildForU" className="h-11 w-11 rounded-2xl" />
            <div>
              <p className="text-lg">BuildForU</p>
              <p className="text-xs text-white/50">{user?.role === "admin" ? "Control tower" : "Field workspace"}</p>
            </div>
          </div>

          <button onClick={onClose} className="rounded-2xl bg-white/10 p-2 lg:hidden">
            <X size={16} />
          </button>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-500/20 p-3 text-brand-300">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm text-white">Crew rhythm is stable</p>
              <p className="text-xs text-white/50">Site updates are syncing smoothly today.</p>
            </div>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
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
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">Shift profile</p>
          <p className="mt-3 text-lg">{user?.name}</p>
          <p className="text-sm text-white/55">{user?.title}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-brand-500 to-emerald-300" />
          </div>
        </div>
      </aside>
    </>
  );
}
