import ProjectsBoard from "../components/projects/ProjectsBoard";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function ProjectsPage() {
  const { user } = useAuth();
  const {
    addProject,
    dataError,
    isDataLoading,
    projects,
    refreshData,
    updateProject,
    updateProjectStatus,
    workers
  } = useAppData();
  const { t } = useI18n();
  const isAdmin = user?.role === "admin";

  return (
    <ProjectsBoard
      isLoading={isDataLoading}
      loadError={dataError}
      title={t("projects.title")}
      subtitle={t("projects.boardSubtitle", "Track active work, assigned crews and project status in one place.")}
      projects={projects}
      onCreateProject={isAdmin ? addProject : null}
      onEditProject={isAdmin ? updateProject : null}
      onRefresh={refreshData}
      onStatusChange={isAdmin ? updateProjectStatus : null}
      workerOptions={workers}
    />
  );
}
