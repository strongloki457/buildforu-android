import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

export default function CalendarMonthNavigation({ monthLabel, onNextMonth, onPrevMonth, onToday }) {
  const { t } = useI18n();

  return (
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
  );
}
