import { CalendarDays, Clock3, Layers3 } from "lucide-react";
import CalendarCard from "../components/dashboard/CalendarCard";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import SectionHeader from "../components/ui/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function CalendarPage() {
  const { user } = useAuth();
  const { tasks } = useAppData();
  const { t } = useI18n();

  const scopedTasks = user.role === "admin" ? tasks : tasks.filter((task) => task.employeeId === user.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CalendarCard title={t("calendar.title")} subtitle={t("calendar.subtitle")} tasks={scopedTasks} />
        <div className="grid gap-4">
          <MetricCard
            icon={CalendarDays}
            label="Scheduled this month"
            value={scopedTasks.length}
            detail="Assignments currently visible on the board."
          />
          <MetricCard
            icon={Layers3}
            label="Coverage"
            value={user.role === "admin" ? "All crews" : "Personal"}
            detail="Switches automatically based on login role."
          />
          <MetricCard
            icon={Clock3}
            label="Next checkpoint"
            value="09:30"
            detail="The closest pending assignment starts tomorrow."
          />
        </div>
      </div>

      <Card>
        <SectionHeader title="Upcoming timeline" subtitle="A quick scroll of the next scheduled activities." />
        <div className="grid gap-3">
          {scopedTasks.map((task) => (
            <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white/80 p-4">
              <div>
                <p className="text-slate-900">{task.title}</p>
                <p className="text-sm text-slate-500">{task.location}</p>
              </div>
              <div className="rounded-2xl bg-brand-50 px-4 py-2 text-sm text-brand-700">{task.date}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
