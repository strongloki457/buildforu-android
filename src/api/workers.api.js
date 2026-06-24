import { apiRequest } from "./client";

export const workersApi = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/workers${query ? `?${query}` : ""}`);
  },

  createWorker(payload) {
    return apiRequest("/api/workers", {
      method: "POST",
      body: payload,
    });
  },

  updateWorker(id, payload) {
    return apiRequest(`/api/workers/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  deleteWorker(id) {
    return apiRequest(`/api/workers/${id}`, {
      method: "DELETE",
    });
  },

  updateRate(id, hourlyRate) {
    return apiRequest(`/api/workers/${id}/rate`, {
      method: "PATCH",
      body: { hourlyRate },
    });
  },
};
