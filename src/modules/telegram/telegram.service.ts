interface ParishRegistrationNotification {
  registrationId: string;
  parishName: string;
  deaneryName: string;
  presidentName: string;
  phoneNumber: string;
  receiptUrl?: string | null;
}

interface FeedingRequestNotification {
  requestId: string;
  fullName: string;
  committeeName: string;
  bankName: string;
  requestNumberToday: number;
}

function escapeHtml(
  value: string
): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function sendParishRegistrationTelegramNotification(
  data: ParishRegistrationNotification
): Promise<void> {
  const botToken =
    process.env.TELEGRAM_BOT_TOKEN;

  const chatId =
    process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn(
      "Telegram bot token or chat ID is missing."
    );

    return;
  }

  const lines = [
    "✅ <b>New Parish Registration</b>",
    "",
    `🏛 <b>Parish:</b> ${escapeHtml(
      data.parishName
    )}`,
    `📍 <b>Deanery:</b> ${escapeHtml(
      data.deaneryName
    )}`,
    `👤 <b>President:</b> ${escapeHtml(
      data.presidentName
    )}`,
    `📞 <b>Phone:</b> ${escapeHtml(
      data.phoneNumber
    )}`,
    `🆔 <b>Registration ID:</b> ${escapeHtml(
      data.registrationId
    )}`,
  ];

  if (data.receiptUrl) {
    lines.push(
      "",
      `🧾 <a href="${escapeHtml(
        data.receiptUrl
      )}">View payment receipt</a>`
    );
  }

  lines.push(
    "",
    "The registration is awaiting review."
  );

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    }
  );

  if (!response.ok) {
    const responseBody =
      await response.text();

    throw new Error(
      `Telegram notification failed: ${responseBody}`
    );
  }
}

export async function sendFeedingRequestTelegramNotification(
  data: FeedingRequestNotification
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_FEEDING_CHAT_ID;
  if (!botToken || !chatId) {
    console.warn(
      "Telegram bot token or feeding chat ID is missing."
    );
    return;
  }

  const text = [
    "🍽️ <b>New Feeding Request</b>",
    "",
    `<b>Name:</b> ${escapeHtml(data.fullName)}`,
    `<b>Committee:</b> ${escapeHtml(data.committeeName)}`,
    `<b>Bank:</b> ${escapeHtml(data.bankName)}`,
    `<b>Request today:</b> ${data.requestNumberToday} of 2`,
    `<b>Request ID:</b> ${escapeHtml(data.requestId)}`,
    "",
    "Open the admin feeding page to approve or reject this request.",
  ].join("\n");

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Telegram notification failed: ${await response.text()}`);
  }
}
