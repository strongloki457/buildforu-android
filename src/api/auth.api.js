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

  me() {
    return apiRequest("/api/auth/me");
  },
};
