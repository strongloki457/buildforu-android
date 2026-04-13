import { useI18n } from "../../hooks/useI18n";
import { getTaskTitle } from "../../utils/localizedValue";

export default function CalendarMonthGrid({ cells, dayLabels, todayKey }) {
  const { t } = useI18n();

  return (
    <div className="hidden grid-cols-7 gap-2 md:grid">
      {dayLabels.map((day) => (
        <div key={day} className="px-2 py-3 text-center text-xs uppercase tracking-[0.2em] text-slate-400">
          {day}
        </div>
      ))}

      {cells.map((cell, index) => {
        const isToday = cell?.dateKey === todayKey;

        return (
          <div
            key={`${cell?.day ?? "empty"}-${index}`}
            className={`min-h-[104px] rounded-3xl border p-3 ${
              cell
                ? isToday
                  ? "border-brand-200 bg-brand-50/80"
                  : "border-white/70 bg-white/70"
                : "border-transparent bg-transparent"
            }`}
          >
            {cell ? (
              <>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isToday ? "text-brand-700" : "text-slate-700"}`}>{cell.day}</span>
                  {cell.matches.length ? (
                    <span className="rounded-full bg-brand-100 px-2 py-1 text-[10px] text-brand-700">
                      {cell.matches.length}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 space-y-2">
                  {cell.matches.slice(0, 2).map((task) => (
                    <div key={task.id} className="rounded-2xl bg-brand-50 px-2 py-1 text-xs text-brand-700">
                      {getTaskTitle(t, task)}
                    </div>
                  ))}
                  {cell.matches.length > 2 ? (
                    <div className="text-[11px] text-slate-400">+{cell.matches.length - 2}</div>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
