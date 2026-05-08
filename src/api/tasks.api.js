import { apiRequest } from "./client";

export const tasksApi = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/tasks${query ? `?${query}` : ""}`);
  },

  createTask(payload) {
    return apiRequest("/api/tasks", {
      method: "POST",
      body: payload,
    });
  },

  updateTask(id, payload) {
    return apiRequest(`/api/tasks/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  deleteTask(id) {
    return apiRequest(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  },
};
