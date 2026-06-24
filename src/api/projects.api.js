import { apiRequest } from "./client";

export const projectsApi = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/projects${query ? `?${query}` : ""}`);
  },

  createProject(payload) {
    return apiRequest("/api/projects", {
      method: "POST",
      body: payload,
    });
  },

  updateProject(id, payload) {
    return apiRequest(`/api/projects/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  deleteProject(id) {
    return apiRequest(`/api/projects/${id}`, {
      method: "DELETE",
    });
  },

  assignWorkers(id, workerIds) {
    return apiRequest(`/api/projects/${id}/workers`, {
      method: "POST",
      body: { workerIds },
    });
  },

  updateBudget(id, budget) {
    return apiRequest(`/api/projects/${id}/budget`, {
      method: "PATCH",
      body: { budget },
    });
  },
};
