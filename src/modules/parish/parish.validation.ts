import { z } from "zod";

export const parishLoginSchema = z.object({
  accessCode: z
    .string()
    .trim()
    .min(6, "Access code is required.")
    .max(30, "Invalid access code."),
});

export const parishRegistrationSchema = z.object({
  presidentName: z
    .string()
    .trim()
    .min(3, "President name is required.")
    .max(100, "President name is too long."),

  presidentPhoneNumber: z
    .string()
    .trim()
    .regex(
      /^[0-9]{11,15}$/,
      "Phone number must contain 11 to 15 digits."
    ),
});

export type ParishLoginRequest = z.infer<typeof parishLoginSchema>;

export type ParishRegistrationRequest = z.infer<
  typeof parishRegistrationSchema
>;

export const updateParishProfileSchema = z.object({
  presidentName: z
    .string()
    .trim()
    .min(3)
    .max(100),

  presidentPhoneNumber: z
    .string()
    .trim()
    .regex(
      /^[0-9]{11,15}$/,
      "Phone number must contain 11 to 15 digits."
    ),
});