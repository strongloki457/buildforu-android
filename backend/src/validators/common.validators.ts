import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().min(1).max(40)
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(20)
});

export const dateRangeQuerySchema = paginationQuerySchema.extend({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
});

export const optionalText = z.string().trim().max(1000).optional();
