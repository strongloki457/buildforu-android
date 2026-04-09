import { CalendarDays } from "lucide-react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import { useI18n } from "../../hooks/useI18n";

function getCalendarCells(tasks) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let index = 0; index < offset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const isoDate = new Date(year, month, day).toISOString().slice(0, 10);
    const matches = tasks.filter((task) => task.date === isoDate);
    cells.push({ day, matches });
  }

  return cells;
}

export default function CalendarCard({ title, subtitle, tasks, action }) {
  const { locale, t } = useI18n();
  const cells = getCalendarCells(tasks);
  const upcomingTasks = [...tasks].sort((left, right) => left.date.localeCompare(right.date)).slice(0, 6);
  const dayLabels = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, { weekday: "short" }).format(
      new Date(Date.UTC(2026, 0, 5 + index))
    )
  );

  return (
    <Card>
      <SectionHeader
        eyebrow={t("calendar.monthlyEyebrow")}
        title={title}
        subtitle={subtitle}
        action={
          action ?? (
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
              <CalendarDays size={18} />
            </div>
          )
        }
      />

      <div className="space-y-4 md:hidden">
        {upcomingTasks.length ? (
          upcomingTasks.map((task) => (
            <div key={task.id} className="rounded-[24px] border border-white/70 bg-white/75 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base text-slate-900">{task.title}</p>
                  <p className="mt-2 text-sm text-slate-500">{task.location}</p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">{task.date}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/50 p-6 text-sm text-slate-500">
            {t("calendar.emptyMonth")}
          </div>
        )}
      </div>

      <div className="hidden grid-cols-7 gap-2 md:grid">
        {dayLabels.map((day) => (
          <div key={day} className="px-2 py-3 text-center text-xs uppercase tracking-[0.2em] text-slate-400">
            {day}
          </div>
        ))}

        {cells.map((cell, index) => (
          <div
            key={`${cell?.day ?? "empty"}-${index}`}
            className={`min-h-[88px] rounded-3xl border p-3 ${
              cell ? "border-white/70 bg-white/70" : "border-transparent bg-transparent"
            }`}
          >
            {cell ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{cell.day}</span>
                  {cell.matches.length ? (
                    <span className="rounded-full bg-brand-100 px-2 py-1 text-[10px] text-brand-700">
                      {cell.matches.length}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 space-y-2">
                  {cell.matches.slice(0, 2).map((task) => (
                    <div key={task.id} className="rounded-2xl bg-brand-50 px-2 py-1 text-xs text-brand-700">
                      {task.title}
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
