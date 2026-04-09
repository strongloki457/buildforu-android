import { CalendarClock, CheckCircle2, ClipboardList, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CalendarCard from "../components/dashboard/CalendarCard";
import ChatPanel from "../components/dashboard/ChatPanel";
import TaskListCard from "../components/dashboard/TaskListCard";
import { DashboardSkeleton } from "../components/ui/LoadingSkeleton";
import MetricCard from "../components/ui/MetricCard";
import SectionHeader from "../components/ui/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { tasks, threads, toggleTaskStatus, sendMessage } = useAppData();
  const { t } = useI18n();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setReady(true), 650);
    return () => window.clearTimeout(timeout);
  }, []);

  const personalTasks = useMemo(() => tasks.filter((task) => task.employeeId === user.id), [tasks, user.id]);
  const personalThreads = useMemo(() => threads.filter((thread) => thread.participants.includes(user.id)), [threads, user.id]);
  const pendingTasks = personalTasks.filter((task) => task.status === "pending");
  const completedTasks = personalTasks.filter((task) => task.status === "completed");

  if (!ready) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[28px] bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 p-6 text-white sm:rounded-[32px] sm:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{t("dashboard.todayFocus")}</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-3xl sm:text-4xl">{t("dashboard.employeeTitle")}</h2>
            <p className="mt-3 max-w-2xl text-white/70">{t("dashboard.employeeHeroBody")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              icon={ClipboardList}
              label={t("dashboard.upcomingTasks")}
              value={pendingTasks.length}
              detail={t("dashboard.employeePendingDetail")}
            />
            <MetricCard
              icon={CheckCircle2}
              label={t("tasks.completed")}
              value={completedTasks.length}
              detail={t("dashboard.employeeCompletedDetail")}
            />
            <MetricCard
              icon={MapPin}
              label={t("dashboard.employeeNextSiteLabel")}
              value={t("dashboard.employeeNextSiteValue")}
              detail={t("dashboard.employeeNextSiteDetail")}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CalendarCard title={t("dashboard.calendarOverview")} subtitle={t("dashboard.employeeCalendarSubtitle")} tasks={personalTasks} />

        <TaskListCard
          title={t("dashboard.upcomingTasks")}
          subtitle={t("dashboard.employeeTaskSubtitle")}
          tasks={personalTasks}
          onToggleStatus={toggleTaskStatus}
          emptyText={t("dashboard.employeeEmptyTasks")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-panel rounded-[32px] p-6">
          <SectionHeader title={t("dashboard.quickPulse")} subtitle={t("dashboard.quickPulseSubtitle")} />
          <div className="grid gap-4">
            <MetricCard
              icon={CalendarClock}
              label={t("dashboard.scheduleConfidence")}
              value="94%"
              detail={t("dashboard.scheduleConfidenceDetail")}
            />
            <div className="rounded-[28px] bg-white/75 p-5">
              <p className="text-sm text-slate-500">{t("dashboard.siteRhythm")}</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-brand-700 to-brand-500" />
              </div>
              <p className="mt-3 text-sm text-slate-500">{t("dashboard.siteRhythmDetail")}</p>
            </div>
          </div>
        </section>

        <ChatPanel
          title={t("dashboard.teamMessages")}
          subtitle={t("dashboard.employeeChatSubtitle")}
          threads={personalThreads}
          user={user}
          onSendMessage={sendMessage}
          placeholder={t("chat.placeholder")}
        />
      </div>
    </div>
  );
}
