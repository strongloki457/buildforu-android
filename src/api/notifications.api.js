import { apiRequest } from "./client";

export const notificationsApi = {
  list() {
    return apiRequest("/api/notifications");
  }
};
