import { apiRequest } from "./client";

export const pushApi = {
  register: (token, platform = "android") =>
    apiRequest("/api/push/register", { method: "POST", body: { token, platform } }),
  unregister: (token) => apiRequest("/api/push/register", { method: "DELETE", body: { token } })
};
