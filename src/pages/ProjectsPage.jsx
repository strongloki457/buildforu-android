import ProjectsBoard from "../components/projects/ProjectsBoard";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function ProjectsPage() {
  const { projects, updateProjectStatus } = useAppData();
  const { t } = useI18n();

  return (
    <ProjectsBoard
      title={t("projects.title")}
      subtitle={t("projects.boardSubtitle", "Track active work, assigned crews and project status in one place.")}
      projects={projects}
      onStatusChange={updateProjectStatus}
    />
  );
}
