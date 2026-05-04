import { ArrowRight, Users2 } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { getProjectName, getProjectPhase } from "../../utils/localizedValue";

export default function ProjectsOverviewCard({ title, subtitle, projects }) {
  const { t } = useI18n();

  return (
    <Card>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-brand-700">
            {t("dashboard.openProjects", "Open projects")}
            <ArrowRight size={15} />
          </Link>
        }
      />

      <div className="space-y-3">
        {projects.length ? (
          projects.map((project) => (
            <div key={project.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base text-slate-900">{getProjectName(t, project)}</p>
                  <p className="mt-1 text-sm text-slate-500">{getProjectPhase(t, project)}</p>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                    <Users2 size={14} className="text-brand-600" />
                    <span>
                      {t("projects.teamAssigned", "Assigned team")}: {project.assignedWorkers.length}
                    </span>
                  </div>
                  {!project.assignedWorkers.length ? (
                    <p className="mt-2 text-sm text-amber-700">
                      {t("projects.noTeamWarning", "Assign at least one worker before scheduling tasks.")}
                    </p>
                  ) : null}
                </div>
                <StatusBadge value={project.status} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-sm text-slate-500">
            {t("projects.emptyStatusGroup", "No projects in this status yet.")} {t("projects.emptyCreateHint", "Create a project before assigning calendar tasks.")}
          </div>
        )}
      </div>
    </Card>
  );
}
