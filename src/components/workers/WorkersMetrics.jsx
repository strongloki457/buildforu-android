import { Activity, BadgeCheck, BriefcaseBusiness, Users } from "lucide-react";
import MetricCard from "../ui/MetricCard";
import { useI18n } from "../../hooks/useI18n";

export default function WorkersMetrics({ workers }) {
  const { t } = useI18n();
  const onSiteCount = workers.filter(
    (worker) => String(worker.attendance?.currentStatus ?? worker.status).toLowerCase() === "on site"
  ).length;
  const offSiteCount = workers.filter(
    (worker) => String(worker.attendance?.currentStatus ?? worker.status).toLowerCase() === "off site"
  ).length;
  const assignedCount = workers.filter(
    (worker) => Array.isArray(worker.projectIds) && worker.projectIds.length > 0
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={Users} label={t("workers.activeWorkers")} value={workers.length} />
      <MetricCard icon={BadgeCheck} label={t("statusLabels.on site", "On Site")} value={onSiteCount} />
      <MetricCard icon={BriefcaseBusiness} label={t("workers.assignedProjects")} value={assignedCount} />
      <MetricCard icon={Activity} label={t("workers.offSite")} value={offSiteCount} />
    </div>
  );
}
