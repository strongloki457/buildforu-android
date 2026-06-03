import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

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
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    JWT_REFRESH_SECRET: z.string().min(32).default("development-only-refresh-secret-change-me"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().email().default("noreply@buildforu.com"),
    GROQ_API_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PRICE_ID_STARTER: z.string().optional(),
    STRIPE_PRICE_ID_PRO: z.string().optional(),
    STRIPE_PRICE_ID_BUSINESS: z.string().optional(),
    STRIPE_PRICE_ID_STARTER_ANNUAL: z.string().optional(),
    STRIPE_PRICE_ID_PRO_ANNUAL: z.string().optional(),
    STRIPE_PRICE_ID_BUSINESS_ANNUAL: z.string().optional()
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
