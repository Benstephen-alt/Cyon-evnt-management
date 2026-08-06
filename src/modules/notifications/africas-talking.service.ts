import AfricasTalking from "africastalking";
import env from "@/config/env";
import { AppError } from "@/shared/errors/AppError";

export interface ProviderRecipientResult {
  phoneNumber: string;
  messageId?: string;
  status: string;
  cost?: string;
  accepted: boolean;
}

export async function sendSmsBatch(
  phoneNumbers: string[],
  message: string
): Promise<ProviderRecipientResult[]> {
  if (!env.AFRICASTALKING_USERNAME || !env.AFRICASTALKING_API_KEY) {
    throw new AppError(
      503,
      "SMS is not configured. Add the Africa's Talking credentials to the backend environment.",
      "SMS_NOT_CONFIGURED"
    );
  }

  const client = AfricasTalking({
    username: env.AFRICASTALKING_USERNAME,
    apiKey: env.AFRICASTALKING_API_KEY,
  });

  const response = await client.SMS.send({
    to: phoneNumbers,
    message,
    ...(env.AFRICASTALKING_SENDER_ID
      ? { senderId: env.AFRICASTALKING_SENDER_ID }
      : {}),
    enqueue: true,
  });

  const recipients = response.SMSMessageData?.Recipients ?? [];
  return recipients.map((recipient) => {
    const status = recipient.status ?? "Unknown";
    const accepted =
      recipient.statusCode === 101 ||
      ["success", "sent", "queued"].some((value) =>
        status.toLowerCase().includes(value)
      );

    return {
      phoneNumber: recipient.number,
      messageId: recipient.messageId,
      status,
      cost: recipient.cost,
      accepted,
    };
  });
}
