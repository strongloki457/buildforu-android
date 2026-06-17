import { z } from "zod";

const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  data: z.string().max(5_000_000)
});

export const sendMessageSchema = z
  .object({
    text: z.string().trim().max(4000).default(""),
    attachments: z.array(attachmentSchema).max(10).optional().default([])
  })
  .refine((d) => d.text.length > 0 || d.attachments.length > 0, {
    message: "Message must have text or at least one attachment."
  });

export const createThreadSchema = z.object({
  otherUserId: z.string().min(1)
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;
