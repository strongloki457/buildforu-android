import { apiRequest } from "./client";

export const attendanceApi = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/attendance${query ? `?${query}` : ""}`);
  },

  start(payload = {}) {
    return apiRequest("/api/attendance/start", {
      method: "POST",
      body: payload,
    });
  },

  end(payload = {}) {
    return apiRequest("/api/attendance/end", {
      method: "POST",
      body: payload,
    });
  },
};
