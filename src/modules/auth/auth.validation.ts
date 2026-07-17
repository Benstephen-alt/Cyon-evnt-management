import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const committeeLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});