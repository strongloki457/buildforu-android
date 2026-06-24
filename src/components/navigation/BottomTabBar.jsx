import { MoreHorizontal } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useI18n } from "../../hooks/useI18n";

export default function BottomTabBar({ items, onMoreClick, isMoreActive }) {
  const { t } = useI18n();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] transition ${
                  isActive ? "text-brand-700" : "text-slate-500"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                  <span className="truncate px-1">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={onMoreClick}
          className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition ${
            isMoreActive ? "text-brand-700" : "text-slate-500"
          }`}
        >
          <MoreHorizontal size={22} strokeWidth={isMoreActive ? 2.4 : 2} />
          <span>{t("common.more", "More")}</span>
        </button>
      </div>
    </nav>
  );
}
