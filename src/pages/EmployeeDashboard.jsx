import { CalendarDays, MessageSquare, PackagePlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import TaskListCard from "../components/dashboard/TaskListCard";
import WorkStatusCard from "../components/dashboard/WorkStatusCard";
import { DashboardSkeleton } from "../components/ui/LoadingSkeleton";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { getLocalDateKey, getUpcomingItemsByDate, sortByDateKey } from "../utils/date";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { tasks, toggleTaskStatus } = useAppData();
  const { t } = useI18n();
  const [ready, setReady] = useState(false);
  const todayKey = getLocalDateKey();

  useEffect(() => {
    const timeout = window.setTimeout(() => setReady(true), 450);
    return () => window.clearTimeout(timeout);
  }, []);

  const personalTasks = useMemo(() => tasks.filter((task) => task.employeeId === user.id), [tasks, user.id]);
  const todayTasks = useMemo(
    () => sortByDateKey(personalTasks.filter((task) => task.date === todayKey)),
    [personalTasks, todayKey]
  );
  const upcomingTasks = useMemo(
    () =>
      getUpcomingItemsByDate(personalTasks)
        .filter((task) => task.date > todayKey)
        .slice(0, 4),
    [personalTasks, todayKey]
  );
  const quickActions = [
    {
      key: "chat",
      label: t("dashboard.openChatAction", "Open chat"),
      description: t("dashboard.employeeQuickChat", "Message the office or your lead without leaving the workflow."),
      icon: MessageSquare,
      to: "/chat"
    },
    {
      key: "materials",
      label: t("dashboard.requestMaterialAction", "Request material"),
      description: t("dashboard.employeeQuickMaterials", "Send a material request tied to your current project."),
      icon: PackagePlus,
      to: "/materials"
    },
    {
      key: "calendar",
      label: t("dashboard.openCalendarAction", "Open calendar"),
      description: t("dashboard.employeeQuickCalendar", "See the full schedule and upcoming assignments."),
      icon: CalendarDays,
      to: "/calendar"
    }
  ];

  if (!ready) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <WorkStatusCard />

        <DashboardQuickActions
          title={t("dashboard.quickActions", "Quick actions")}
          subtitle={t(
            "dashboard.employeeQuickActionsSubtitle",
            "Shortcuts for the pages you use most during the work day."
          )}
          actions={quickActions}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <TaskListCard
          title={t("dashboard.todayTasks", "Today's tasks")}
          subtitle={t(
            "dashboard.todayTasksSubtitle",
            "Your assignments for today, with quick status updates when work is done."
          )}
          tasks={todayTasks}
          onToggleStatus={toggleTaskStatus}
          emptyText={t("dashboard.noTasksTodayEmployee", "No tasks are scheduled for you today.")}
        />

        <TaskListCard
          title={t("dashboard.mySchedule", "My schedule")}
          subtitle={t(
            "dashboard.myScheduleSubtitle",
            "Next scheduled items after today so you can plan the rest of the week."
          )}
          tasks={upcomingTasks}
          maxItems={4}
          emptyText={t("dashboard.noUpcomingTasks", "No upcoming tasks are scheduled right now.")}
        />
      </div>
    </div>
  );
}
