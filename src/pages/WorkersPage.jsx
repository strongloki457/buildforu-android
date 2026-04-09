import { Activity, BadgeCheck, Users } from "lucide-react";
import WorkersPanel from "../components/dashboard/WorkersPanel";
import MetricCard from "../components/ui/MetricCard";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function WorkersPage() {
  const { workers } = useAppData();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Users} label="Active workers" value={workers.length} detail="All visible in the command center." />
        <MetricCard icon={BadgeCheck} label="Available now" value="2" detail="Two workers can accept additional tasks." />
        <MetricCard icon={Activity} label="Avg. performance" value="85%" detail="Calculated from the mock completion rate." />
      </div>
      <WorkersPanel title={t("workers.title")} subtitle={t("workers.subtitle")} workers={workers} />
    </div>
  );
}
