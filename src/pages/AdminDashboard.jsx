import { CalendarDays, ClipboardPlus, FolderPlus, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { DashboardSkeleton } from "../components/ui/LoadingSkeleton";
import Modal from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";
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
  const { companyUsers, syncWorkerUser } = useAuth();
  const { t } = useI18n();
  const [ready, setReady] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [workerFormError, setWorkerFormError] = useState("");
  const [workerAccess, setWorkerAccess] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const todayKey = getLocalDateKey();

  useEffect(() => {
    const timeout = window.setTimeout(() => setReady(true), 500);
    return () => window.clearTimeout(timeout);
  }, []);

  const quickActions = [
    {
      key: "add-worker",
      label: t("workers.addWorker"),
      description: t("dashboard.quickAddWorker", "Create a worker profile and assign current projects."),
      icon: UserPlus,
      onClick: () => setShowWorkerModal(true)
    },
    {
      key: "add-project",
      label: t("projects.addProjectAction", "Add project"),
      description: t("dashboard.quickAddProject", "Start a new project card for the company workspace."),
      icon: FolderPlus,
      onClick: () => setShowProjectModal(true)
    },
    {
      key: "add-task",
      label: t("calendar.addTask"),
      description: t("dashboard.quickAddTask", "Assign work for today or upcoming site activity."),
      icon: ClipboardPlus,
      onClick: () => setShowTaskModal(true)
    },
    {
      key: "open-calendar",
      label: t("dashboard.openCalendarAction", "Open calendar"),
      description: t("dashboard.quickOpenCalendar", "Jump to the full company schedule and planning view."),
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

  if (!ready) {
    return <DashboardSkeleton />;
  }

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
          onSave={(payload) => {
            const normalizedEmail = normalizeEmail(payload.email);
            const conflictingUser = companyUsers.find((member) => normalizeEmail(member.email) === normalizedEmail);

            if (!normalizedEmail) {
              setWorkerFormError(t("workers.workerEmailRequired", "Email is required to create an employee login."));
              return;
            }

            if (conflictingUser) {
              setWorkerFormError(t("workers.workerEmailDuplicate", "This email is already used by another company user."));
              return;
            }

            const createdWorker = addWorker(payload);

            if (createdWorker) {
              const access = syncWorkerUser({
                companyId: createdWorker.companyId,
                workspaceId: createdWorker.workspaceId,
                workerId: createdWorker.id,
                name: createdWorker.name,
                email: normalizedEmail
              });

              if (access?.temporaryPassword) {
                setWorkerAccess({
                  email: normalizedEmail,
                  temporaryPassword: access.temporaryPassword
                });
              }

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
          onSave={(payload) => {
            const createdProject = addProject(payload);

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

      {workerAccess ? <WorkerAccessModal access={workerAccess} onClose={() => setWorkerAccess(null)} /> : null}
    </div>
  );
}
