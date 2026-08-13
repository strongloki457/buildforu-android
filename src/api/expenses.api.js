import { apiRequest } from "./client";

export const expensesApi = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/expenses${query ? `?${query}` : ""}`);
  },

  create(payload) {
    return apiRequest("/api/expenses", {
      method: "POST",
      body: payload,
    });
  },

  update(id, payload) {
    return apiRequest(`/api/expenses/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  delete(id) {
    return apiRequest(`/api/expenses/${id}`, {
      method: "DELETE",
    });
  },
};
