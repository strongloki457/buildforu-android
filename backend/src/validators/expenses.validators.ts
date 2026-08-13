import { z } from "zod";
import { optionalText } from "./common.validators";

export const createExpenseSchema = z.object({
  projectId: z.string().min(1),
  category: z.string().trim().max(80).optional(),
  description: optionalText,
  amount: z.number().nonnegative().max(10_000_000),
  date: z.coerce.date()
});

export const updateExpenseSchema = z.object({
  category: z.string().trim().max(80).optional(),
  description: optionalText,
  amount: z.number().nonnegative().max(10_000_000).optional(),
  date: z.coerce.date().optional()
});

export const expensesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(50),
  projectId: z.string().min(1).optional()
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpensesQuery = z.infer<typeof expensesQuerySchema>;
