import { apiRequest } from "./client";

export const materialsApi = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/materials${query ? `?${query}` : ""}`);
  },

  createRequest(payload) {
    return apiRequest("/api/materials", {
      method: "POST",
      body: payload,
    });
  },

  updateStatus(id, status) {
    return apiRequest(`/api/materials/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  deleteRequest(id) {
    return apiRequest(`/api/materials/${id}`, {
      method: "DELETE",
    });
  },
};
