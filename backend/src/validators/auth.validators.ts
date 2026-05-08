import { z } from "zod";

export const registerCompanySchema = z.object({
  companyName: z.string().trim().min(2).max(140),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(128),
  plan: z.string().trim().max(40).optional().default("starter")
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1).max(128)
});

export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
