import { AlertTriangle, Building2, FileText } from "lucide-react";
import ProjectsOverviewCard from "../components/dashboard/ProjectsOverviewCard";
import MetricCard from "../components/ui/MetricCard";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function ProjectsPage() {
  const { projects } = useAppData();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Building2} label={t("projects.activeBuilds")} value={projects.length} detail={t("projects.activeBuildsDetail")} />
        <MetricCard icon={AlertTriangle} label={t("projects.atRisk")} value="1" detail={t("projects.atRiskDetail")} />
        <MetricCard icon={FileText} label={t("projects.averageProgress")} value="72%" detail={t("projects.averageProgressDetail")} />
      </div>
      <ProjectsOverviewCard title={t("projects.title")} subtitle={t("projects.subtitle")} projects={projects} />
    </div>
  );
}
