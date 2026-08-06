import { z } from "zod";

const audienceFields = {
  audiences: z.array(z.enum(["DELEGATES", "PRESIDENTS", "SEMINARIANS"]))
    .min(1, "Select at least one recipient group."),
  seminarianNumbers: z.array(z.string()).max(5000).default([]),
};

function requireSeminarianNumbers(
  data: { audiences: string[]; seminarianNumbers: string[] },
  ctx: z.RefinementCtx
) {
    if (
      data.audiences.includes("SEMINARIANS") &&
      data.seminarianNumbers.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seminarianNumbers"],
        message: "Add at least one seminarian phone number.",
      });
    }
}

export const notificationRequestSchema = z.object({
  message: z.string().trim().min(1).max(918),
  ...audienceFields,
}).superRefine(requireSeminarianNumbers);

export const previewNotificationSchema = z.object({
  message: z.string().optional().default(""),
  ...audienceFields,
}).superRefine(requireSeminarianNumbers);

export type NotificationRequest = z.infer<typeof notificationRequestSchema>;
