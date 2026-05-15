import { z } from "zod";

export const sendMessageSchema = z.object({
  text: z.string().trim().min(1).max(4000)
});

export const createThreadSchema = z.object({
  otherUserId: z.string().min(1)
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;
