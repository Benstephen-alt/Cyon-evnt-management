import { z } from "zod";
import { UserRole } from "@prisma/client";

export const createAdminSchema = z.object({
  fullName: z.string().trim().min(3).max(120),

  email: z.string().email(),

  phoneNumber: z.string().optional(),

  password: z.string().min(6),

  role: z.nativeEnum(UserRole),
});

export const updateAdminSchema = z.object({
  fullName: z.string().trim().min(3).max(120).optional(),

  email: z.string().email().optional(),

  phoneNumber: z.string().optional(),

  role: z.nativeEnum(UserRole).optional(),
});