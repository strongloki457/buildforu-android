import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { getLocalDateKey, sortByDateKey } from "../../utils/date";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import { useI18n } from "../../hooks/useI18n";
import { getTaskLocation, getTaskTitle } from "../../utils/localizedValue";

function getCalendarCells(tasks, referenceDate) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < offset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const dateKey = getLocalDateKey(new Date(year, month, day));
    const matches = tasks.filter((task) => task.date === dateKey);

    cells.push({
      day,
      dateKey,
      matches
    });
  }

  return cells;
}

function formatMonthLabel(date, locale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    month: "long",
    year: "numeric"
  }).format(date);
}

export default function CalendarCard({
  title,
  subtitle,
  tasks,
  currentDate = new Date(),
  onPrevMonth,
  onNextMonth,
  onToday,
  action
}) {
  const { locale, t } = useI18n();
  const cells = getCalendarCells(tasks, currentDate);
  const tasksInView = sortByDateKey(tasks).slice(0, 8);
  const monthLabel = formatMonthLabel(currentDate, locale);
  const todayKey = getLocalDateKey();
  const hasNavigation = Boolean(onPrevMonth || onNextMonth || onToday);
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

      {hasNavigation ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/70 bg-white/75 p-3 sm:p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {t("calendar.selectedMonth", "Selected month")}
            </p>
            <p className="mt-1 text-lg capitalize text-slate-950">{monthLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onToday ? (
              <button
                type="button"
                onClick={onToday}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                {t("common.today")}
              </button>
            ) : null}

            <button
              type="button"
              onClick={onPrevMonth}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              aria-label={t("calendar.previousMonth", "Previous month")}
              title={t("calendar.previousMonth", "Previous month")}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={onNextMonth}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              aria-label={t("calendar.nextMonth", "Next month")}
              title={t("calendar.nextMonth", "Next month")}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-4 md:hidden">
        {tasksInView.length ? (
          tasksInView.map((task) => (
            <div key={task.id} className="rounded-[24px] border border-white/70 bg-white/75 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base text-slate-900">{getTaskTitle(t, task)}</p>
                  <p className="mt-2 text-sm text-slate-500">{getTaskLocation(t, task)}</p>
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
    </Card>
  );
}
