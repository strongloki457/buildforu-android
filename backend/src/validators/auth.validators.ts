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
  plan: z.literal("starter").optional().default("starter")
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().optional().default(true)
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

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .refine((p) => /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p), {
      message: "Password must include uppercase, lowercase, and numeric characters."
    })
});

export const updateAvatarSchema = z.object({
  avatarUrl: z
    .string()
    .max(50_000, "Image is too large (max 50 KB).")
    .refine((v) => /^data:image\/(jpeg|png|webp|gif);base64,/.test(v), {
      message: "Must be a valid base64 image data URL (jpeg, png, webp or gif)."
    })
    .nullable()
});

export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>;
