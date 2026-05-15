import { z } from "zod";

export const registerCompanySchema = z.object({
  companyName: z.string().trim().min(2).max(140),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().toLowerCase(),
  password: z
    .string()
    .min(8)
    .max(128)
    .refine((password) => /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password), {
      message: "Password must include uppercase, lowercase, and numeric characters."
    }),
  plan: z.string().trim().max(40).optional().default("starter")
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1).max(128)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .max(128)
    .refine((p) => /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p), {
      message: "Password must include uppercase, lowercase, and numeric characters."
    })
});

export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
