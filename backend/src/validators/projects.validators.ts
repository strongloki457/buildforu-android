import { ProjectStatus } from "@prisma/client";
import { z } from "zod";
import { optionalText } from "./common.validators";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(160),
  status: z.nativeEnum(ProjectStatus).optional().default(ProjectStatus.TO_START),
  note: optionalText,
  workerIds: z.array(z.string().min(1)).optional().default([])
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  note: optionalText,
  workerIds: z.array(z.string().min(1)).optional()
});

export const assignProjectWorkersSchema = z.object({
  workerIds: z.array(z.string().min(1)).default([])
});

export const projectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(20),
  status: z.nativeEnum(ProjectStatus).optional()
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AssignProjectWorkersInput = z.infer<typeof assignProjectWorkersSchema>;
export type ProjectsQuery = z.infer<typeof projectsQuerySchema>;
