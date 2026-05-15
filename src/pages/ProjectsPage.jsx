import ProjectsBoard from "../components/projects/ProjectsBoard";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function ProjectsPage() {
  const {
    addProject,
    dataError,
    isDataLoading,
    projects,
    refreshData,
    updateProjectStatus,
    workers
  } = useAppData();
  const { t } = useI18n();

  return (
    <ProjectsBoard
      isLoading={isDataLoading}
      loadError={dataError}
      title={t("projects.title")}
      subtitle={t("projects.boardSubtitle", "Track active work, assigned crews and project status in one place.")}
      projects={projects}
      onCreateProject={addProject}
      onRefresh={refreshData}
      onStatusChange={updateProjectStatus}
      workerOptions={workers}
    />
  );
}
