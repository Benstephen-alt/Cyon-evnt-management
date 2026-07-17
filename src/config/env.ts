import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  PORT: z.coerce.number().default(5000),

  APP_NAME: z.string().min(1),

  APP_URL: z.string().url(),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long."),

  JWT_EXPIRES_IN: z.string(),

  BCRYPT_SALT_ROUNDS: z.coerce.number().min(10).max(15),

  MAX_FILE_SIZE: z.coerce.number(),

  UPLOAD_DIR: z.string(),

  PHOTO_OUTPUT_DIR: z.string(),

  RECEIPT_OUTPUT_DIR: z.string(),

  BADGE_OUTPUT_DIR: z.string(),

  BADGE_QR_SIZE: z.coerce.number(),

  DEFAULT_EVENT_PREFIX: z.string(),

  FRONTEND_URL: z.string().url(),

  LOG_LEVEL: z.string(),

  SMTP_HOST: z.string().optional(),

  SMTP_PORT: z.string().optional(),

  SMTP_USER: z.string().optional(),

  SMTP_PASSWORD: z.string().optional(),

  SMS_PROVIDER: z.string().optional(),

  SMS_API_KEY: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("\n❌ Invalid environment configuration\n");

  parsed.error.issues.forEach((issue) => {
    console.error(`• ${issue.path.join(".")}: ${issue.message}`);
  });

  process.exit(1);
}

export const env = parsed.data;

export default env;