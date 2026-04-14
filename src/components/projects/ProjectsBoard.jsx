import { useMemo, useState } from "react";
import { projectStatusOptions } from "../../data/options";
import { useI18n } from "../../hooks/useI18n";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import ProjectCard from "./ProjectCard";
import ProjectDetailsModal from "./ProjectDetailsModal";

export default function ProjectsBoard({ title, subtitle, projects, onStatusChange }) {
  const { t } = useI18n();
  const [activeProjectId, setActiveProjectId] = useState("");
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;
  const groupedProjects = useMemo(
    () =>
      projectStatusOptions.map((status) => ({
        status,
        projects: projects.filter((project) => project.status === status)
      })),
    [projects]
  );

  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="grid gap-4 xl:grid-cols-3">
        {groupedProjects.map((group) => (
          <section key={group.status} className="rounded-[26px] bg-slate-50/80 p-4">
            <div className="flex items-center justify-between gap-3 border-b border-white/80 pb-4">
              <div>
                <p className="text-sm text-slate-900">{t(`statusLabels.${group.status.toLowerCase()}`, group.status)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {t("projects.projectCount", { count: group.projects.length }, "{{count}} projects")}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              {group.projects.length ? (
                group.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    onStatusChange={onStatusChange}
                    onViewDetails={setActiveProjectId}
                    project={project}
                  />
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-white/70 px-4 py-5 text-sm text-slate-500">
                  {t("projects.emptyStatusGroup", "No projects in this status yet.")}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {activeProject ? (
        <ProjectDetailsModal
          onClose={() => setActiveProjectId("")}
          onStatusChange={onStatusChange}
          project={activeProject}
        />
      ) : null}
    </Card>
  );
}
