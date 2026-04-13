import { useState } from "react";
import { useI18n } from "../../hooks/useI18n";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import ProjectCard from "./ProjectCard";
import ProjectDetailsModal from "./ProjectDetailsModal";

export default function ProjectsBoard({ title, subtitle, projects }) {
  const { locale } = useI18n();
  const [activeProjectId, setActiveProjectId] = useState("");
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;

  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="grid gap-4 xl:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            locale={locale}
            onViewDetails={setActiveProjectId}
            project={project}
          />
        ))}
      </div>

      {activeProject ? <ProjectDetailsModal project={activeProject} onClose={() => setActiveProjectId("")} /> : null}
    </Card>
  );
}
