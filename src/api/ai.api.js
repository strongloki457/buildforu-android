import { apiRequest } from "./client";

export const aiApi = {
  chat(messages) {
    return apiRequest("/api/ai/chat", {
      method: "POST",
      body: { messages }
    });
  }
};
