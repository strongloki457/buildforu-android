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

  sendMessage(threadId, text, attachments = []) {
    const apiAttachments = attachments
      .filter((a) => a.previewUrl)
      .map((a) => ({ id: a.id, name: a.name, type: a.type, data: a.previewUrl }));
    return apiRequest(`/api/chat/threads/${threadId}/messages`, {
      method: "POST",
      body: { text, attachments: apiAttachments }
    });
  },

  deleteMessage(threadId, messageId) {
    return apiRequest(`/api/chat/threads/${threadId}/messages/${messageId}`, { method: "DELETE" });
  },

  getCompanyUsers() {
    return apiRequest("/api/chat/users");
  }
};
