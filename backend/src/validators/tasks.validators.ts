import { TaskStatus } from "@prisma/client";
import { z } from "zod";

export const tasksQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(20),
  status: z.nativeEnum(TaskStatus).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().max(1000).optional(),
  date: z.coerce.date(),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
  workerId: z.string().min(1).optional().or(z.literal("")),
  projectId: z.string().min(1).optional().or(z.literal(""))
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(180).optional(),
  description: z.string().trim().max(1000).optional(),
  date: z.coerce.date().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  workerId: z.string().min(1).optional().nullable().or(z.literal("")),
  projectId: z.string().min(1).optional().nullable().or(z.literal(""))
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TasksQuery = z.infer<typeof tasksQuerySchema>;
