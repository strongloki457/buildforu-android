import { CalendarDays } from "lucide-react";
import CalendarMobileTaskList from "../calendar/CalendarMobileTaskList";
import CalendarMonthGrid from "../calendar/CalendarMonthGrid";
import CalendarMonthNavigation from "../calendar/CalendarMonthNavigation";
import { formatMonthLabel, getCalendarCells, getWeekdayLabels } from "../calendar/calendarUtils";
import { getLocalDateKey, sortByDateKey } from "../../utils/date";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import { useI18n } from "../../hooks/useI18n";

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
  const dayLabels = getWeekdayLabels(locale);

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
        <CalendarMonthNavigation
          monthLabel={monthLabel}
          onNextMonth={onNextMonth}
          onPrevMonth={onPrevMonth}
          onToday={onToday}
        />
      ) : null}

      <CalendarMobileTaskList tasks={tasksInView} />
      <CalendarMonthGrid cells={cells} dayLabels={dayLabels} todayKey={todayKey} />
    </Card>
  );
}
