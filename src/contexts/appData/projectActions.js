import { normalizeProjectRecord } from "./projects";
import { projectStatusOptions } from "../../data/options";

export function createProjectActions({ dispatch, projectsById }) {
  return {
    addProject(project) {
      const normalizedProject = normalizeProjectRecord(project, null);

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
