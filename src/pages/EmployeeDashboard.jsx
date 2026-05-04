import { CalendarDays, ClipboardList, PackagePlus } from "lucide-react";
import { useMemo } from "react";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import TaskListCard from "../components/dashboard/TaskListCard";
import WorkStatusCard from "../components/dashboard/WorkStatusCard";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { useVisibleTasks } from "../hooks/useRoleData";
import { getLocalDateKey, getUpcomingItemsByDate, sortByDateKey } from "../utils/date";

export default function EmployeeDashboard() {
  const { toggleTaskStatus } = useAppData();
  const { t } = useI18n();
  const personalTasks = useVisibleTasks();
  const todayKey = getLocalDateKey();
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
      key: "tasks",
      label: t("dashboard.openTasksAction", "Open tasks"),
      description: t("dashboard.employeeQuickTasks", "See every assigned task."),
      icon: ClipboardList,
      to: "/tasks"
    },
    {
      key: "materials",
      label: t("dashboard.requestMaterialAction", "Request material"),
      description: t("dashboard.employeeQuickMaterials", "Ask for supplies by project."),
      icon: PackagePlus,
      to: "/materials"
    },
    {
      key: "calendar",
      label: t("dashboard.openCalendarAction", "Open calendar"),
      description: t("dashboard.employeeQuickCalendar", "Check the next site visit."),
      icon: CalendarDays,
      to: "/calendar"
    }
  ];

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
