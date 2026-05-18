import { Plus, RotateCw } from "lucide-react";
import { useMemo, useState } from "react";
import CalendarEntryForm from "../components/calendar/CalendarEntryForm";
import CalendarCard from "../components/dashboard/CalendarCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { useVisibleCalendarEntries } from "../hooks/useRoleData";
import { getLocalDateKey, isDateKeyInMonth } from "../utils/date";
import { getProjectNotes, getTaskLocation, getTaskProjectName, getTaskTitle } from "../utils/localizedValue";

export default function CalendarPage() {
  const { user } = useAuth();
  const { workers, projects, addProject, addTask, dataError, isDataLoading, refreshData } = useAppData();
  const { locale, t } = useI18n();
  const scopedCalendarEntries = useVisibleCalendarEntries();
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [visibleDate, setVisibleDate] = useState(() => new Date());
  const entriesInVisibleMonth = useMemo(
    () => scopedCalendarEntries.filter((entry) => isDateKeyInMonth(entry.date, visibleDate)),
    [scopedCalendarEntries, visibleDate]
  );
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
        month: "long",
        year: "numeric"
      }).format(visibleDate),
    [locale, visibleDate]
  );
  const initialEntryDate = useMemo(() => {
    const today = new Date();
    const sameMonth =
      today.getFullYear() === visibleDate.getFullYear() && today.getMonth() === visibleDate.getMonth();

    return sameMonth
      ? getLocalDateKey(today)
      : getLocalDateKey(new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1));
  }, [visibleDate]);

  return (
    <div className="space-y-6">
      <CalendarCard
        title={t("calendar.title")}
        subtitle={t("calendar.primarySubtitle", "Monthly schedule for the current team view.")}
        tasks={entriesInVisibleMonth}
        currentDate={visibleDate}
        onPrevMonth={() => setVisibleDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
        onNextMonth={() => setVisibleDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
        onToday={() => setVisibleDate(new Date())}
        action={
          user.role === "admin" ? (
            <Button className="w-full gap-2 sm:w-auto" onClick={() => setShowEntryModal(true)}>
              <Plus size={16} />
              {t("calendar.addEntry", "Add entry")}
            </Button>
          ) : undefined
        }
      />

      <Card>
        <SectionHeader
          eyebrow={t("calendar.scheduleList", "Schedule list")}
          title={monthLabel}
          subtitle={t(
            "calendar.scheduleListMixedSubtitle",
            "Tasks and project dates planned for the selected month."
          )}
          action={
            <div className="rounded-2xl bg-brand-50 px-4 py-2 text-sm text-brand-700">
              {t("calendar.entriesPlanned", { count: entriesInVisibleMonth.length }, "{{count}} entries planned")}
            </div>
          }
        />
        {dataError ? (
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <span className="break-anywhere">{dataError}</span>
            <button
              type="button"
              onClick={refreshData}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-amber-900 shadow-sm"
            >
              <RotateCw size={14} />
              {t("common.retry", "Retry")}
            </button>
          </div>
        ) : null}
        <div className="grid gap-3">
          {isDataLoading && !scopedCalendarEntries.length ? (
            [0, 1, 2].map((item) => (
              <div key={item} className="rounded-[22px] bg-white/80 p-4 sm:rounded-[24px]">
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-200" />
                <div className="mt-4 h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
              </div>
            ))
          ) : entriesInVisibleMonth.length ? (
            entriesInVisibleMonth.map((entry) => (
              <div key={entry.id} className="rounded-[22px] bg-white/80 p-4 sm:rounded-[24px]">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="break-anywhere text-slate-900">{getTaskTitle(t, entry)}</p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600">
                        {entry.entryType === "project"
                          ? t("calendar.entryTypes.project", "Project")
                          : t("calendar.entryTypes.task", "Task")}
                      </span>
                      {entry.entryType === "project" ? <StatusBadge value={entry.status} /> : null}
                    </div>

                    {entry.entryType === "task" && getTaskProjectName(t, entry) ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {t("common.project")}: {getTaskProjectName(t, entry)}
                      </p>
                    ) : null}

                    <p className="break-anywhere mt-2 text-sm text-slate-500">{getTaskLocation(t, entry) || t("common.location", "Location")}</p>

                    {entry.entryType === "project" && getProjectNotes(t, entry) ? (
                      <p className="break-anywhere mt-2 text-sm text-slate-500">{getProjectNotes(t, entry)}</p>
                    ) : null}
                  </div>

                  <div className="w-fit rounded-2xl bg-brand-50 px-4 py-2 text-sm text-brand-700">{entry.date}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/50 p-6 text-sm text-slate-500">
              {t("calendar.noTasksInView", "No tasks are scheduled in this month.")}
            </div>
          )}
        </div>
      </Card>

      {showEntryModal ? (
        <Modal
          onClose={() => setShowEntryModal(false)}
          title={t("calendar.entryModalTitle", "Create calendar entry")}
          description={t(
            "calendar.entryModalSubtitle",
            "Choose whether you want to add a task or create a project directly from the calendar."
          )}
        >
          <CalendarEntryForm
            initialDate={initialEntryDate}
            projects={projects}
            workers={workers}
            onCreateTask={async (payload) => {
              const createdTask = await addTask(payload);

              if (createdTask) {
                setShowEntryModal(false);
              }

              return createdTask;
            }}
            onCreateProject={async (payload) => {
              const createdProject = await addProject(payload);

              if (createdProject) {
                setShowEntryModal(false);
              }

              return createdProject;
            }}
          />
        </Modal>
      ) : null}
    </div>
  );
}
