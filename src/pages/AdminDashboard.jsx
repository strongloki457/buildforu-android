import { Briefcase, CircleDollarSign, ClipboardCheck, Users2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CalendarCard from "../components/dashboard/CalendarCard";
import ChatPanel from "../components/dashboard/ChatPanel";
import ProjectsOverviewCard from "../components/dashboard/ProjectsOverviewCard";
import WorkersPanel from "../components/dashboard/WorkersPanel";
import { DashboardSkeleton } from "../components/ui/LoadingSkeleton";
import MetricCard from "../components/ui/MetricCard";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { tasks, threads, workers, finance, projects, sendMessage } = useAppData();
  const { t } = useI18n();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setReady(true), 700);
    return () => window.clearTimeout(timeout);
  }, []);

  const pendingCount = useMemo(() => tasks.filter((task) => task.status === "pending").length, [tasks]);

  if (!ready) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[28px] bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 p-6 text-white sm:rounded-[32px] sm:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{t("dashboard.activeProjects")}</p>
        <div className="mt-4 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h2 className="text-3xl sm:text-4xl">{t("dashboard.adminTitle")}</h2>
            <p className="mt-3 max-w-2xl text-white/70">{t("dashboard.adminHeroBody")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              icon={Users2}
              label={t("dashboard.crewAvailability")}
              value={workers.length}
              detail={t("dashboard.adminCrewDetail")}
            />
            <MetricCard
              icon={ClipboardCheck}
              label={t("dashboard.upcomingTasks")}
              value={pendingCount}
              detail={t("dashboard.adminOpenAssignments")}
            />
            <MetricCard
              icon={Briefcase}
              label={t("dashboard.activeProjects")}
              value={projects.length}
              detail={t("dashboard.adminProjectDetail")}
            />
            <MetricCard
              icon={CircleDollarSign}
              label={t("dashboard.monthlyRevenue")}
              value={finance.revenue}
              detail={t("dashboard.adminRevenueDetail")}
            />
          </div>
        </div>
      </section>

      <WorkersPanel title={t("dashboard.workerPulse")} subtitle={t("dashboard.workerPulseSubtitle")} workers={workers} />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <CalendarCard title={t("dashboard.calendarOverview")} subtitle={t("dashboard.calendarSubtitle")} tasks={tasks} />
        <ProjectsOverviewCard
          title={t("dashboard.projectHealth")}
          subtitle={t("dashboard.projectSubtitle")}
          projects={projects}
        />
      </div>

      <ChatPanel
        title={t("dashboard.teamMessages")}
        subtitle={t("dashboard.chatSubtitle")}
        threads={threads}
        user={user}
        onSendMessage={sendMessage}
        placeholder={t("chat.placeholder")}
      />
    </div>
  );
}
