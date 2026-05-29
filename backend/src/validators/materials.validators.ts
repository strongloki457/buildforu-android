import { MaterialRequestStatus } from "@prisma/client";
import { z } from "zod";
import { optionalText } from "./common.validators";

export const materialsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(20),
  status: z.nativeEnum(MaterialRequestStatus).optional()
});

export const createMaterialRequestSchema = z.object({
  itemName: z.string().trim().min(1).max(180),
  quantity: z.string().trim().max(120).optional(),
  note: optionalText,
  projectId: z.string().min(1).optional().or(z.literal("")),
  requesterWorkerId: z.string().min(1).optional().or(z.literal(""))
});

export const updateMaterialStatusSchema = z.object({
  status: z.nativeEnum(MaterialRequestStatus)
});

export type CreateMaterialRequestInput = z.infer<typeof createMaterialRequestSchema>;
export type MaterialsQuery = z.infer<typeof materialsQuerySchema>;
