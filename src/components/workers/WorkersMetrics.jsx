import { Activity, BadgeCheck, BriefcaseBusiness, Users } from "lucide-react";
import { useMemo } from "react";
import MetricCard from "../ui/MetricCard";
import { useI18n } from "../../hooks/useI18n";

export default function WorkersMetrics({ workers }) {
  const { t } = useI18n();

  const availableCount = useMemo(
    () => workers.filter((worker) => String(worker.availability).toLowerCase() === "available").length,
    [workers]
  );

  const averageCompletionRate = useMemo(() => {
    if (!workers.length) {
      return "0%";
    }

    const total = workers.reduce((sum, worker) => sum + Number(worker.completionRate || 0), 0);
    return `${Math.round(total / workers.length)}%`;
  }, [workers]);

  const offSiteCount = useMemo(
    () =>
      workers.filter((worker) => String(worker.attendance?.currentStatus ?? worker.status).toLowerCase() === "off site")
        .length,
    [workers]
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={Users}
        label={t("workers.activeWorkers")}
        value={workers.length}
        detail={t("workers.activeWorkersDetail")}
      />
      <MetricCard
        icon={BadgeCheck}
        label={t("workers.availableNow")}
        value={availableCount}
        detail={t("workers.availableNowDetail")}
      />
      <MetricCard
        icon={Activity}
        label={t("workers.averagePerformance")}
        value={averageCompletionRate}
        detail={t("workers.averagePerformanceDetail")}
      />
      <MetricCard
        icon={BriefcaseBusiness}
        label={t("workers.offSite")}
        value={offSiteCount}
        detail={t("workers.offSiteDetail")}
      />
    </div>
  );
}
