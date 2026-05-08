import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const envSchema = z
  .object({
    DATABASE_URL: z
      .string()
      .url()
      .default("postgresql://postgres:postgres@localhost:5432/buildforu?schema=public"),
    JWT_SECRET: z.string().min(32).default("development-only-buildforu-secret-change-me"),
    JWT_EXPIRES_IN: z.string().default("1h"),
    FRONTEND_URL: z.string().min(1).default("http://localhost:5173"),
    PORT: z.coerce.number().int().positive().default(5000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development")
  })
  .superRefine((value, context) => {
    if (isProduction && value.JWT_SECRET === "development-only-buildforu-secret-change-me") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "JWT_SECRET must be configured with a strong production secret."
      });
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;

export function getAllowedOrigins() {
  return env.FRONTEND_URL.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
