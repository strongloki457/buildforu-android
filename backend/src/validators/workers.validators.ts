import { z } from "zod";
import { optionalText } from "./common.validators";

export const createWorkerSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().toLowerCase().optional().or(z.literal("")),
    phone: z.string().trim().max(60).optional(),
    notes: optionalText,
    projectIds: z.array(z.string().min(1)).optional().default([]),
    createLogin: z.boolean().optional().default(false),
    linkExistingUserId: z.string().optional()
  })
  .superRefine((value, context) => {
    if (value.createLogin && !value.email && !value.linkExistingUserId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Email is required when createLogin is enabled."
      });
    }
  });

export const updateWorkerSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().toLowerCase().optional().or(z.literal("")),
  phone: z.string().trim().max(60).optional(),
  notes: optionalText,
  projectIds: z.array(z.string().min(1)).optional(),
  createLogin: z.boolean().optional().default(false),
  linkExistingUserId: z.string().optional()
}).superRefine((value, context) => {
  if (value.createLogin && value.email === "" && !value.linkExistingUserId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "Email is required when createLogin is enabled."
    });
  }
});

export type CreateWorkerInput = z.infer<typeof createWorkerSchema>;
export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>;
