import { CalendarDays, Clock3, Layers3, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import AssignmentPanel from "../components/dashboard/AssignmentPanel";
import CalendarCard from "../components/dashboard/CalendarCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import Modal from "../components/ui/Modal";
import SectionHeader from "../components/ui/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { getLocalDateKey, getUpcomingItemsByDate, isDateKeyInMonth, sortByDateKey } from "../utils/date";
import { getTaskLocation, getTaskProjectName, getTaskTitle } from "../utils/localizedValue";

function formatShortDate(dateKey, locale) {
  if (!dateKey) {
    return "--";
  }

  const [year, month, day] = String(dateKey).split("-").map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return "--";
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    day: "2-digit",
    month: "short"
  }).format(new Date(year, month - 1, day));
}

export default function CalendarPage() {
  const { user } = useAuth();
  const { tasks, workers, projects, addTask } = useAppData();
  const { locale, t } = useI18n();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [visibleDate, setVisibleDate] = useState(() => new Date());

  const scopedTasks = useMemo(
    () => (user.role === "admin" ? tasks : tasks.filter((task) => task.employeeId === user.id)),
    [tasks, user.id, user.role]
  );
  const upcomingTasks = useMemo(() => getUpcomingItemsByDate(scopedTasks), [scopedTasks]);
  const tasksInVisibleMonth = useMemo(
    () => sortByDateKey(scopedTasks.filter((task) => isDateKeyInMonth(task.date, visibleDate))),
    [scopedTasks, visibleDate]
  );
  const nextUpcomingTask = upcomingTasks[0] ?? null;
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
        month: "long",
        year: "numeric"
      }).format(visibleDate),
    [locale, visibleDate]
  );
  const initialTaskDate = useMemo(() => {
    const today = new Date();
    const sameMonth =
      today.getFullYear() === visibleDate.getFullYear() && today.getMonth() === visibleDate.getMonth();

    return sameMonth
      ? getLocalDateKey(today)
      : getLocalDateKey(new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1));
  }, [visibleDate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CalendarCard
          title={t("calendar.title")}
          subtitle={t("calendar.subtitle")}
          tasks={tasksInVisibleMonth}
          currentDate={visibleDate}
          onPrevMonth={() => setVisibleDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
          onNextMonth={() => setVisibleDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
          onToday={() => setVisibleDate(new Date())}
          action={
            user.role === "admin" ? (
              <Button className="w-full gap-2 sm:w-auto" onClick={() => setShowTaskModal(true)}>
                <Plus size={16} />
                {t("calendar.addTask")}
              </Button>
            ) : undefined
          }
        />
        <div className="grid gap-4">
          <MetricCard
            icon={CalendarDays}
            label={t("calendar.scheduledInView", "Scheduled in view")}
            value={tasksInVisibleMonth.length}
            detail={t("calendar.scheduledInViewDetail", { month: monthLabel }, monthLabel)}
          />
          <MetricCard
            icon={Layers3}
            label={t("calendar.coverage")}
            value={user.role === "admin" ? t("calendar.coverageAllCrews") : t("calendar.coveragePersonal")}
            detail={t("calendar.coverageDetail")}
          />
          <MetricCard
            icon={Clock3}
            label={t("calendar.nextCheckpoint")}
            value={nextUpcomingTask ? formatShortDate(nextUpcomingTask.date, locale) : "--"}
            detail={
              nextUpcomingTask
                ? `${getTaskTitle(t, nextUpcomingTask)} - ${getTaskLocation(t, nextUpcomingTask)}`
                : t("calendar.nextCheckpointDetail")
            }
          />
        </div>
      </div>

      <Card>
        <SectionHeader
          eyebrow={t("calendar.scheduleList", "Schedule list")}
          title={monthLabel}
          subtitle={t("calendar.scheduleListSubtitle", "Tasks planned for the selected month.")}
        />
        <div className="grid gap-3">
          {tasksInVisibleMonth.length ? (
            tasksInVisibleMonth.map((task) => (
              <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white/80 p-4">
                <div>
                  <p className="text-slate-900">{getTaskTitle(t, task)}</p>
                  {getTaskProjectName(t, task) ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {t("common.project")}: {getTaskProjectName(t, task)}
                    </p>
                  ) : null}
                  <p className="text-sm text-slate-500">{getTaskLocation(t, task)}</p>
                </div>
                <div className="rounded-2xl bg-brand-50 px-4 py-2 text-sm text-brand-700">{task.date}</div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/50 p-6 text-sm text-slate-500">
              {t("calendar.noTasksInView", "No tasks are scheduled in this month.")}
            </div>
          )}
        </div>
      </Card>

      {showTaskModal ? (
        <Modal
          onClose={() => setShowTaskModal(false)}
          title={t("calendar.formTitle")}
          description={t("calendar.formSubtitle")}
        >
          <AssignmentPanel
            workers={workers}
            projects={projects}
            initialDate={initialTaskDate}
            onAssign={(payload) => {
              const createdTask = addTask(payload);

              if (createdTask) {
                setShowTaskModal(false);
              }
            }}
            embedded
          />
        </Modal>
      ) : null}
    </div>
  );
}
