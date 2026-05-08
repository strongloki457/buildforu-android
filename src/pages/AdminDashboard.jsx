import { CalendarDays, ClipboardPlus, FolderPlus, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AssignmentPanel from "../components/dashboard/AssignmentPanel";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import MaterialsSummaryCard from "../components/dashboard/MaterialsSummaryCard";
import ProjectsOverviewCard from "../components/dashboard/ProjectsOverviewCard";
import TaskListCard from "../components/dashboard/TaskListCard";
import WorkersPanel from "../components/dashboard/WorkersPanel";
import ProjectFormModal from "../components/projects/ProjectFormModal";
import WorkerAccessModal from "../components/workers/WorkerAccessModal";
import WorkerFormModal from "../components/workers/WorkerFormModal";
import { emptyWorkerForm } from "../components/workers/workerFormState";
import Modal from "../components/ui/Modal";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { getLocalDateKey, sortByDateKey } from "../utils/date";

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export default function AdminDashboard() {
  const {
    addProject,
    addTask,
    addWorker,
    materialRequests,
    projects,
    tasks,
    workers
  } = useAppData();
  const { t } = useI18n();
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [workerFormError, setWorkerFormError] = useState("");
  const [workerAccess, setWorkerAccess] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const todayKey = getLocalDateKey();

  const quickActions = [
    {
      key: "add-worker",
      label: t("workers.addWorker"),
      description: t("dashboard.quickAddWorker", "Add login and project access."),
      icon: UserPlus,
      onClick: () => setShowWorkerModal(true)
    },
    {
      key: "add-project",
      label: t("projects.addProjectAction", "Add project"),
      description: t("dashboard.quickAddProject", "Create the job site record."),
      icon: FolderPlus,
      onClick: () => setShowProjectModal(true)
    },
    {
      key: "add-task",
      label: t("calendar.addTask"),
      description: t("dashboard.quickAddTask", "Put work on the calendar."),
      icon: ClipboardPlus,
      onClick: () => setShowTaskModal(true)
    },
    {
      key: "open-calendar",
      label: t("dashboard.openCalendarAction", "Open calendar"),
      description: t("dashboard.quickOpenCalendar", "Review team schedule."),
      icon: CalendarDays,
      to: "/calendar"
    }
  ];

  const todayTasks = useMemo(
    () => sortByDateKey(tasks.filter((task) => task.date === todayKey)),
    [tasks, todayKey]
  );
  const recentMaterialRequests = useMemo(
    () =>
      [...materialRequests]
        .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
        .slice(0, 4),
    [materialRequests]
  );

  return (
    <div className="space-y-6">
      <DashboardQuickActions
        title={t("dashboard.quickActions", "Quick actions")}
        subtitle={t(
          "dashboard.adminQuickActionsSubtitle",
          "Shortcuts for the most common daily updates in the workspace."
        )}
        actions={quickActions}
      />

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <WorkersPanel
          title={t("dashboard.workersSummary", "Workers overview")}
          subtitle={t(
            "dashboard.workersSummarySubtitle",
            "See who is on site, off site and which project each worker is linked to."
          )}
          workers={workers}
        />
        <ProjectsOverviewCard
          title={t("dashboard.projectBoardLabel", "Projects overview")}
          subtitle={t(
            "dashboard.projectBoardSubtitle",
            "Track active projects, assigned workers and current project status."
          )}
          projects={projects}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <MaterialsSummaryCard requests={recentMaterialRequests} />

        <TaskListCard
          title={t("dashboard.todaySchedule", "Today's schedule")}
          subtitle={t(
            "dashboard.todayScheduleSubtitle",
            "Assignments planned for today across the company team."
          )}
          tasks={todayTasks}
          showAssignee
          emptyText={t("dashboard.noTasksToday", "No tasks are scheduled for today.")}
          action={
            <Link to="/calendar" className="inline-flex items-center gap-2 text-sm text-brand-700">
              {t("dashboard.openCalendarAction", "Open calendar")}
            </Link>
          }
        />
      </div>

      {showWorkerModal ? (
        <WorkerFormModal
          errorMessage={workerFormError}
          initialValues={emptyWorkerForm}
          mode="create"
          onClose={() => {
            setWorkerFormError("");
            setShowWorkerModal(false);
          }}
          onSave={async (payload) => {
            const normalizedEmail = normalizeEmail(payload.email);
            const shouldSyncLogin = Boolean(payload.createLogin);
            const conflictingUser = shouldSyncLogin
              ? workers.find((worker) => normalizeEmail(worker.email) === normalizedEmail)
              : null;

            if (!String(payload.name ?? "").trim()) {
              setWorkerFormError(t("workers.workerNameRequired", "Full name is required."));
              return;
            }

            if (shouldSyncLogin && !normalizedEmail) {
              setWorkerFormError(t("workers.workerEmailRequired", "Email is required to create an employee login."));
              return;
            }

            if (shouldSyncLogin && conflictingUser) {
              setWorkerFormError(t("workers.workerEmailDuplicate", "This email is already used by another company user."));
              return;
            }

            const createdWorker = await addWorker(payload);

            if (createdWorker && shouldSyncLogin) {
              if (createdWorker._temporaryPassword) {
                setWorkerAccess({
                  email: normalizedEmail,
                  temporaryPassword: createdWorker._temporaryPassword
                });
              }

              setWorkerFormError("");
              setShowWorkerModal(false);
            } else if (createdWorker) {
              setWorkerFormError("");
              setShowWorkerModal(false);
            }
          }}
          projectOptions={projects}
        />
      ) : null}

      {showProjectModal ? (
        <ProjectFormModal
          onClose={() => setShowProjectModal(false)}
          workerOptions={workers}
          onSave={async (payload) => {
            const createdProject = await addProject(payload);

            if (createdProject) {
              setShowProjectModal(false);
            }
          }}
        />
      ) : null}

      {showTaskModal ? (
        <Modal
          onClose={() => setShowTaskModal(false)}
          title={t("calendar.formTitle")}
          description={t("calendar.formSubtitle")}
        >
          <AssignmentPanel
            workers={workers}
            projects={projects}
            initialDate={todayKey}
            onAssign={async (payload) => {
              const createdTask = await addTask(payload);

              if (createdTask) {
                setShowTaskModal(false);
              }
            }}
            embedded
          />
        </Modal>
      ) : null}

      {workerAccess ? <WorkerAccessModal access={workerAccess} onClose={() => setWorkerAccess(null)} /> : null}
    </div>
  );
}
