import {
  NotificationAudience,
  NotificationRecipientType,
  NotificationStatus,
  SmsDeliveryStatus,
} from "@prisma/client";
import prisma from "@/config/prisma";
import { AppError } from "@/shared/errors/AppError";
import { getActiveEvent } from "@/shared/services/event.service";
import { sendSmsBatch } from "./africas-talking.service";
import { NotificationRequest } from "./notification.validation";

interface RawRecipient {
  name?: string;
  phoneNumber: string;
  type: NotificationRecipientType;
}

export function normalizeNigerianPhoneNumber(value: string): string | null {
  const number = value.trim().replace(/[\s()-]/g, "");

  if (/^\+234[789]\d{9}$/.test(number)) return number;
  if (/^234[789]\d{9}$/.test(number)) return `+${number}`;
  if (/^0[789]\d{9}$/.test(number)) return `+234${number.slice(1)}`;

  return null;
}

async function resolveRecipients(data: Pick<NotificationRequest, "audiences" | "seminarianNumbers">) {
  const event = await getActiveEvent();
  const recipients: RawRecipient[] = [];

  if (data.audiences.includes("DELEGATES")) {
    const delegates = await prisma.delegate.findMany({
      where: { eventId: event.id },
      select: { fullName: true, phoneNumber: true },
    });
    recipients.push(
      ...delegates.map((delegate) => ({
        name: delegate.fullName,
        phoneNumber: delegate.phoneNumber,
        type: NotificationRecipientType.DELEGATE,
      }))
    );
  }

  if (data.audiences.includes("PRESIDENTS")) {
    const [online, manual] = await Promise.all([
      prisma.parishAccount.findMany({
        where: { eventId: event.id },
        select: { presidentName: true, presidentPhoneNumber: true },
      }),
      prisma.manualParishRegistration.findMany({
        where: { eventId: event.id },
        select: { presidentName: true, presidentPhone: true },
      }),
    ]);
    recipients.push(
      ...online.map((president) => ({
        name: president.presidentName,
        phoneNumber: president.presidentPhoneNumber,
        type: NotificationRecipientType.PRESIDENT,
      })),
      ...manual.map((president) => ({
        name: president.presidentName,
        phoneNumber: president.presidentPhone,
        type: NotificationRecipientType.PRESIDENT,
      }))
    );
  }

  if (data.audiences.includes("SEMINARIANS")) {
    recipients.push(
      ...data.seminarianNumbers.map((phoneNumber) => ({
        phoneNumber,
        type: NotificationRecipientType.SEMINARIAN,
      }))
    );
  }

  const valid = new Map<string, RawRecipient & { phoneNumber: string }>();
  const invalid: RawRecipient[] = [];
  for (const recipient of recipients) {
    const normalized = normalizeNigerianPhoneNumber(recipient.phoneNumber);
    if (!normalized) {
      invalid.push(recipient);
      continue;
    }
    if (!valid.has(normalized)) valid.set(normalized, { ...recipient, phoneNumber: normalized });
  }

  return { event, valid: [...valid.values()], invalid };
}

export async function previewRecipients(data: Pick<NotificationRequest, "audiences" | "seminarianNumbers">) {
  const { valid, invalid } = await resolveRecipients(data);
  const counts = valid.reduce(
    (result, recipient) => {
      result[recipient.type] += 1;
      return result;
    },
    { DELEGATE: 0, PRESIDENT: 0, SEMINARIAN: 0 } as Record<NotificationRecipientType, number>
  );
  return {
    total: valid.length,
    invalidCount: invalid.length,
    invalidNumbers: invalid.map((recipient) => recipient.phoneNumber),
    counts,
  };
}

function getAudience(audiences: NotificationRequest["audiences"]): NotificationAudience {
  if (audiences.length !== 1) return NotificationAudience.MIXED;
  return NotificationAudience[audiences[0]];
}

export async function sendNotification(data: NotificationRequest, userId: string) {
  const { event, valid, invalid } = await resolveRecipients(data);
  if (valid.length === 0) {
    throw new AppError(400, "No valid recipient phone numbers were found.", "NO_VALID_RECIPIENTS");
  }

  const campaign = await prisma.notificationCampaign.create({
    data: {
      eventId: event.id,
      createdByUserId: userId,
      message: data.message,
      audience: getAudience(data.audiences),
      status: NotificationStatus.PROCESSING,
      recipientCount: valid.length,
      invalidCount: invalid.length,
      recipients: {
        create: [
          ...valid.map((recipient) => ({
            phoneNumber: recipient.phoneNumber,
            recipientName: recipient.name,
            recipientType: recipient.type,
          })),
          ...invalid.map((recipient) => ({
            phoneNumber: recipient.phoneNumber,
            recipientName: recipient.name,
            recipientType: recipient.type,
            deliveryStatus: SmsDeliveryStatus.REJECTED,
            providerStatus: "Invalid phone number",
            failureReason: "Phone number is not a valid Nigerian mobile number.",
          })),
        ],
      },
    },
  });

  let acceptedCount = 0;
  let failedCount = 0;
  const costs: string[] = [];

  try {
    for (let index = 0; index < valid.length; index += 100) {
      const batch = valid.slice(index, index + 100);
      const results = await sendSmsBatch(batch.map((recipient) => recipient.phoneNumber), data.message);
      const resultByNumber = new Map(results.map((result) => [result.phoneNumber, result]));

      for (const recipient of batch) {
        const result = resultByNumber.get(recipient.phoneNumber);
        const accepted = Boolean(result?.accepted);
        if (accepted) acceptedCount += 1;
        else failedCount += 1;
        if (result?.cost) costs.push(result.cost);

        await prisma.notificationRecipient.updateMany({
          where: { campaignId: campaign.id, phoneNumber: recipient.phoneNumber },
          data: {
            providerMessageId: result?.messageId,
            providerStatus: result?.status ?? "No provider result returned",
            providerCost: result?.cost,
            deliveryStatus: accepted ? SmsDeliveryStatus.SENT : SmsDeliveryStatus.FAILED,
            failureReason: accepted ? null : result?.status ?? "Provider did not accept this message.",
          },
        });
      }
    }

    const status = failedCount === 0
      ? NotificationStatus.COMPLETED
      : acceptedCount === 0
        ? NotificationStatus.FAILED
        : NotificationStatus.PARTIALLY_FAILED;

    return prisma.notificationCampaign.update({
      where: { id: campaign.id },
      data: {
        status,
        acceptedCount,
        failedCount,
        providerCost: costs.length ? costs.join(", ") : null,
        completedAt: new Date(),
      },
      include: { recipients: true },
    });
  } catch (error) {
    await prisma.notificationCampaign.update({
      where: { id: campaign.id },
      data: {
        status: NotificationStatus.FAILED,
        acceptedCount,
        failedCount: valid.length - acceptedCount,
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function getNotificationHistory() {
  return prisma.notificationCampaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      createdBy: { select: { email: true, admin: { select: { fullName: true } } } },
    },
  });
}

export async function getNotificationById(id: string) {
  const campaign = await prisma.notificationCampaign.findUnique({
    where: { id },
    include: {
      recipients: { orderBy: { createdAt: "asc" } },
      createdBy: { select: { email: true, admin: { select: { fullName: true } } } },
    },
  });
  if (!campaign) throw new AppError(404, "Notification campaign not found.");
  return campaign;
}
