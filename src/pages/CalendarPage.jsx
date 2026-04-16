import { Plus } from "lucide-react";
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
import { getLocalDateKey, isDateKeyInMonth, sortByDateKey } from "../utils/date";
import { getProjectNotes, getTaskLocation, getTaskProjectName, getTaskTitle } from "../utils/localizedValue";

function buildProjectCalendarEvent(project) {
  return {
    id: `project-event-${project.id}`,
    entryType: "project",
    date: project.startDate,
    title: project.name,
    titleKey: project.nameKey,
    projectId: project.id,
    projectName: project.name,
    projectNameKey: project.nameKey,
    location: project.location,
    locationKey: project.locationKey,
    notes: project.notes,
    notesKey: project.notesKey,
    status: project.status
  };
}

export default function CalendarPage() {
  const { user } = useAuth();
  const { tasks, workers, projects, addProject, addTask } = useAppData();
  const { locale, t } = useI18n();
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [visibleDate, setVisibleDate] = useState(() => new Date());
  const currentWorkerId = user.workerId || user.id;

  const scopedTasks = useMemo(
    () => (user.role === "admin" ? tasks : tasks.filter((task) => task.employeeId === currentWorkerId)),
    [currentWorkerId, tasks, user.role]
  );
  const scopedProjectEvents = useMemo(() => {
    const visibleProjects =
      user.role === "admin"
        ? projects
        : projects.filter((project) => project.assignedWorkers.some((worker) => worker.id === currentWorkerId));

    return visibleProjects.filter((project) => project.startDate).map((project) => buildProjectCalendarEvent(project));
  }, [currentWorkerId, projects, user.role]);
  const scopedCalendarEntries = useMemo(
    () => sortByDateKey([...scopedTasks.map((task) => ({ ...task, entryType: "task" })), ...scopedProjectEvents]),
    [scopedProjectEvents, scopedTasks]
  );
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
        <div className="grid gap-3">
          {entriesInVisibleMonth.length ? (
            entriesInVisibleMonth.map((entry) => (
              <div key={entry.id} className="rounded-[24px] bg-white/80 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-slate-900">{getTaskTitle(t, entry)}</p>
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

                    <p className="mt-2 text-sm text-slate-500">{getTaskLocation(t, entry) || t("common.location", "Location")}</p>

                    {entry.entryType === "project" && getProjectNotes(t, entry) ? (
                      <p className="mt-2 text-sm text-slate-500">{getProjectNotes(t, entry)}</p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl bg-brand-50 px-4 py-2 text-sm text-brand-700">{entry.date}</div>
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
            onCreateTask={(payload) => {
              const createdTask = addTask(payload);

              if (createdTask) {
                setShowEntryModal(false);
              }

              return createdTask;
            }}
            onCreateProject={(payload) => {
              const createdProject = addProject(payload);

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
