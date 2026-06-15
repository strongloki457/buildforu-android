import { apiRequest } from "./client";

export const authApi = {
  registerCompany(payload) {
    return apiRequest("/api/auth/register-company", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  login(payload) {
    return apiRequest("/api/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  selectCompany(payload) {
    return apiRequest("/api/auth/select-company", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  me() {
    return apiRequest("/api/auth/me");
  },

  switchRole(role) {
    return apiRequest("/api/auth/switch-role", {
      method: "POST",
      body: { role },
    });
  },

  refresh(refreshToken) {
    return apiRequest("/api/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      auth: false,
    });
  },
};
