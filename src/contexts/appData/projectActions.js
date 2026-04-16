import { normalizeProjectRecord } from "./projects";
import { projectStatusOptions } from "../../data/options";

function applyWorkspaceScope(payload, currentUser) {
  return {
    ...payload,
    companyId: payload.companyId ?? currentUser?.companyId,
    workspaceId: payload.workspaceId ?? currentUser?.workspaceId
  };
}

export function createProjectActions({ currentUser, dispatch, projectsById }) {
  return {
    addProject(project) {
      if (currentUser?.role && currentUser.role !== "admin") {
        return null;
      }

      const normalizedProject = normalizeProjectRecord(applyWorkspaceScope(project, currentUser), null);

      if (!normalizedProject.name) {
        return null;
      }

      dispatch({
        type: "ADD_PROJECT",
        payload: normalizedProject
      });

      return normalizedProject;
    },
    updateProjectStatus(projectId, status) {
      if (currentUser?.role && currentUser.role !== "admin") {
        return null;
      }

      const project = projectsById.get(projectId);

      if (!project || !projectStatusOptions.includes(status)) {
        return null;
      }

      dispatch({
        type: "UPDATE_PROJECT_STATUS",
        payload: {
          projectId,
          status
        }
      });

      return {
        ...project,
        status
      };
    }
  };
}
