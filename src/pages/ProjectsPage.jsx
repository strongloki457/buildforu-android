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
        <MetricCard icon={Building2} label="Active builds" value={projects.length} detail="Current live portfolio." />
        <MetricCard icon={AlertTriangle} label="At risk" value="1" detail="One site requires closer monitoring." />
        <MetricCard icon={FileText} label="Avg. progress" value="72%" detail="Portfolio completion midpoint." />
      </div>
      <ProjectsOverviewCard title={t("projects.title")} subtitle={t("projects.subtitle")} projects={projects} />
    </div>
  );
}
