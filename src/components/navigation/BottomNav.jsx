import { NavLink } from "react-router-dom";

export default function BottomNav({ navItems }) {
  const primaryItems = navItems.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/92 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_45px_-34px_rgba(15,23,42,0.45)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {primaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] transition ${
                  isActive ? "bg-brand-700 text-white" : "text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                }`
              }
            >
              <Icon size={18} />
              <span className="w-full truncate text-center">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
