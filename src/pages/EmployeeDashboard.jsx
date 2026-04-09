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

  const personalTasks = useMemo(
    () => tasks.filter((task) => task.employeeId === user.id),
    [tasks, user.id]
  );
  const personalThreads = useMemo(
    () => threads.filter((thread) => thread.participants.includes(user.id)),
    [threads, user.id]
  );
  const pendingTasks = personalTasks.filter((task) => task.status === "pending");
  const completedTasks = personalTasks.filter((task) => task.status === "completed");

  if (!ready) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[32px] bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{t("dashboard.todayFocus")}</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-4xl">{t("dashboard.employeeTitle")}</h2>
            <p className="mt-3 max-w-2xl text-white/70">
              Your schedule is aligned for the week. The next site checkpoint is already pinned and your boss chat stays a tap away.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              icon={ClipboardList}
              label={t("dashboard.upcomingTasks")}
              value={pendingTasks.length}
              detail="Pending assignments"
            />
            <MetricCard
              icon={CheckCircle2}
              label={t("tasks.completed")}
              value={completedTasks.length}
              detail="Finished this week"
            />
            <MetricCard
              icon={MapPin}
              label="Next site"
              value="North River"
              detail="Inspection at 09:30"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CalendarCard
          title={t("dashboard.calendarOverview")}
          subtitle="See your assigned work blocks and site visits for the current month."
          tasks={personalTasks}
        />

        <TaskListCard
          title={t("dashboard.upcomingTasks")}
          subtitle="Your personal assignments"
          tasks={personalTasks}
          onToggleStatus={toggleTaskStatus}
          emptyText="No assignments are waiting right now."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-panel rounded-[32px] p-6">
          <SectionHeader
            title="Quick pulse"
            subtitle="A concise read on your workload and schedule quality."
          />
          <div className="grid gap-4">
            <MetricCard
              icon={CalendarClock}
              label="Schedule confidence"
              value="94%"
              detail="No conflicts detected in your next five shifts."
            />
            <div className="rounded-[28px] bg-white/75 p-5">
              <p className="text-sm text-slate-500">Site rhythm</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-brand-700 to-brand-500" />
              </div>
              <p className="mt-3 text-sm text-slate-500">Material delivery and inspection timing are both on track.</p>
            </div>
          </div>
        </section>

        <ChatPanel
          title={t("dashboard.teamMessages")}
          subtitle="Fast chat with your boss"
          threads={personalThreads}
          user={user}
          onSendMessage={sendMessage}
          placeholder={t("chat.placeholder")}
        />
      </div>
    </div>
  );
}
