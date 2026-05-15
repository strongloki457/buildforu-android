import { apiRequest } from "./client";

export const chatApi = {
  getThreads() {
    return apiRequest("/api/chat/threads");
  },

  createThread(otherUserId) {
    return apiRequest("/api/chat/threads", {
      method: "POST",
      body: { otherUserId }
    });
  },

  sendMessage(threadId, text) {
    return apiRequest(`/api/chat/threads/${threadId}/messages`, {
      method: "POST",
      body: { text }
    });
  },

  getCompanyUsers() {
    return apiRequest("/api/chat/users");
  }
};
