import { BriefcaseBusiness, CheckCircle2, FolderKanban, Users2 } from "lucide-react";
import { useMemo } from "react";
import ProjectsBoard from "../components/projects/ProjectsBoard";
import MetricCard from "../components/ui/MetricCard";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function ProjectsPage() {
  const { projects, workers } = useAppData();
  const { t } = useI18n();

  const inProgressCount = useMemo(
    () => projects.filter((project) => String(project.status).toLowerCase() === "in progress").length,
    [projects]
  );
  const completedCount = useMemo(
    () => projects.filter((project) => String(project.status).toLowerCase() === "completed").length,
    [projects]
  );
  const assignedPeopleCount = useMemo(
    () => workers.filter((worker) => String(worker.assignedProject ?? "").trim().length > 0).length,
    [workers]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={FolderKanban}
          label={t("projects.totalProjects", "Total projects")}
          value={projects.length}
          detail={t("projects.totalProjectsDetail", "Every project currently tracked in the workspace.")}
        />
        <MetricCard
          icon={BriefcaseBusiness}
          label={t("projects.inProgressProjects", "In progress")}
          value={inProgressCount}
          detail={t("projects.inProgressProjectsDetail", "Projects currently moving on site or in delivery.")}
        />
        <MetricCard
          icon={CheckCircle2}
          label={t("projects.completedProjects", "Completed")}
          value={completedCount}
          detail={t("projects.completedProjectsDetail", "Projects already delivered or fully closed.")}
        />
        <MetricCard
          icon={Users2}
          label={t("projects.peopleAssigned", "People assigned")}
          value={assignedPeopleCount}
          detail={t("projects.peopleAssignedDetail", "Workers currently mapped to active project work.")}
        />
      </div>

      <ProjectsBoard
        title={t("projects.title")}
        subtitle={t(
          "projects.subtitle",
          "Watch delivery momentum and risk across active sites."
        )}
        projects={projects}
        workers={workers}
      />
    </div>
  );
}
