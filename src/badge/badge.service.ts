import prisma from "@/config/prisma";
import QRCode from "qrcode";
import sharp from "sharp";
import path from "path";
import { BADGE_CONFIG } from "@/assets/badge.config";
import { createSvgText } from "@/shared/utils/createSvgText";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const archiver = require("archiver");
import { PassThrough } from "stream";
import { getActiveEvent } from "@/shared/services/event.service";
import { generateQrToken, verifyQrToken } from "@/shared/utils/jwt";

dotenv.config();

export async function generateBadge(delegateId: string) {
  const delegate = await prisma.delegate.findUnique({
    where: {
        id: delegateId,
    },
    include: {
        event: true,
        parish: {
          select: { parishName: true },
        },
    },
});

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  const fullName = delegate.fullName?.trim();
  const parishName = delegate.parishName?.trim() || delegate.parish.parishName?.trim();
  const delegateNumber = delegate.delegateNumber?.trim();

  const missingFields = [
    !fullName && "name",
    !parishName && "parish",
    !delegateNumber && "delegate number",
  ].filter(Boolean);
  if (missingFields.length) {
    throw new Error(
      `Cannot generate badge for delegate ${delegateNumber || delegate.id}: missing ${missingFields.join(", ")}.`
    );
  }




  // Generate QR Code
  const token = generateQrToken({
  type: "DELEGATE",
  delegateNumber,
  eventYear: delegate.event.year,
});


const qrBuffer = await QRCode.toBuffer(token, {
  width: 500,
  margin: 1,
});

  // Create SVG text
  const [nameSvg, parishSvg, idSvg] = await Promise.all([
  createSvgText({
    text: fullName,
    width: BADGE_CONFIG.name.width,
    fontSize: BADGE_CONFIG.name.fontSize,
    color: BADGE_CONFIG.name.color,
  }),

  createSvgText({
    text: wrapParishName(parishName),
    width: BADGE_CONFIG.parish.width,
    fontSize: BADGE_CONFIG.parish.fontSize,
    color: BADGE_CONFIG.parish.color,
  }),

  createSvgText({
    text: delegateNumber,
    width: BADGE_CONFIG.delegateId.width,
    fontSize: BADGE_CONFIG.delegateId.fontSize,
    color: BADGE_CONFIG.delegateId.color,
  }),
]);



  // Load template
  const templatePath = path.resolve(BADGE_CONFIG.template);

  // Resize QR
  const resizedQr = await sharp(qrBuffer)
    .resize(BADGE_CONFIG.qr.size, BADGE_CONFIG.qr.size)
    .png()
    .toBuffer();

  // Generate badge

  const badge = await sharp(templatePath)
    .composite([
      {
        input: nameSvg,
        left: BADGE_CONFIG.name.x,
        top: BADGE_CONFIG.name.y,
      },
      {
        input: parishSvg,
        left: BADGE_CONFIG.parish.x,
        top: BADGE_CONFIG.parish.y,
      },
      {
        input: idSvg,
        left: BADGE_CONFIG.delegateId.x,
        top: BADGE_CONFIG.delegateId.y,
      },
      {
        input: resizedQr,
        left: BADGE_CONFIG.qr.x,
        top: BADGE_CONFIG.qr.y,
      },
    ])
    .png()
    .toBuffer();

  return badge;
}

function wrapParishName(parish: string): string {
  const maxLength = 22;

  if (parish.length <= maxLength) {
    return parish;
  }

  const commaIndex = parish.indexOf(",");

  if (commaIndex !== -1) {
    return (
      parish.substring(0, commaIndex + 1) +
      "\n" +
      parish.substring(commaIndex + 2)
    );
  }

  const words = parish.split(" ");
  const middle = Math.ceil(words.length / 2);

  return (
    words.slice(0, middle).join(" ") +
    "\n" +
    words.slice(middle).join(" ")
  );
}


export async function verifyBadge(token: string) {
  let payload: {
    type: string;
    delegateNumber: string;
    eventYear: number;
  };

  try {
    payload = verifyQrToken(token);
  } catch {
    throw new Error("Invalid or expired QR code.");
  }

  if (payload.type !== "DELEGATE") {
    throw new Error("Invalid delegate QR code.");
  }


  const delegate = await prisma.delegate.findUnique({
    where: {
      delegateNumber: payload.delegateNumber,
    },
    include: {
      parish: {
        include: {
          deanery: true,
        },
      },
      event: true,
    },
  });

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  if (delegate.event.year !== payload.eventYear) {
    throw new Error("QR code belongs to another event.");
  }

  return {
    success: true,
    verified: true,
    delegate: {
      delegateNumber: delegate.delegateNumber,
      fullName: delegate.fullName,
      parish: delegate.parishName,
      deanery: delegate.deaneryName,
      event: delegate.event.eventName,
    },
  };
}

export async function getDelegateById(delegateId: string) {
  const delegate = await prisma.delegate.findUnique({
    where: {
      id: delegateId,
    },
  });

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  return delegate;
}

export async function downloadParishBadges(parishId: string) {
  const event = await getActiveEvent();

  const delegates = await prisma.delegate.findMany({
    where: {
      parishId,
      eventId: event.id,
    },
    orderBy: {
      delegateNumber: "asc",
    },
  });

  if (delegates.length === 0) {
    throw new Error("No delegates found for this parish.");
  }

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  const stream = new PassThrough();

  archive.on("warning", (err: any) => {
    console.warn(err);
  });

  archive.on("error", (err: any) => {
    throw err;
  });

  archive.pipe(stream);

  for (const delegate of delegates) {
    const badge = await generateBadge(delegate.id);

    archive.append(badge, {
      name: `${delegate.delegateNumber}.png`,
    });
  }

  archive.finalize();

  return {
    stream,
    parishName: delegates[0].parishName,
  };
}

export async function downloadAdminParishBadges(parishId: string) {
  return downloadParishBadges(parishId);
}

function zipSafeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "Unnamed";
}

export async function downloadDeaneryBadges(deaneryId: string) {
  const event = await getActiveEvent();
  const deanery = await prisma.deanery.findFirst({
    where: { id: deaneryId, eventId: event.id },
    include: {
      parishes: {
        where: {
          delegates: {
            some: { eventId: event.id },
          },
        },
        orderBy: { parishName: "asc" },
        include: {
          delegates: {
            where: { eventId: event.id },
            orderBy: { delegateNumber: "asc" },
            select: { id: true, delegateNumber: true, fullName: true },
          },
        },
      },
    },
  });

  if (!deanery) throw new Error("Deanery not found for the active event.");

  const delegateCount = deanery.parishes.reduce(
    (total, parish) => total + parish.delegates.length,
    0
  );
  if (delegateCount === 0) throw new Error("No registered delegates found in this deanery.");

  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = new PassThrough();
  archive.on("error", (error: Error) => stream.destroy(error));
  archive.pipe(stream);

  for (const parish of deanery.parishes) {
    const parishFolder = zipSafeName(parish.parishName);

    for (const delegate of parish.delegates) {
      let badge: Buffer;
      try {
        badge = await generateBadge(delegate.id);
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown badge generation error.";
        throw new Error(
          `Badge generation failed for ${delegate.delegateNumber?.trim() || delegate.id} (${delegate.fullName?.trim() || "unnamed delegate"}) in ${parish.parishName}: ${reason}`
        );
      }
      archive.append(badge, {
        name: `${parishFolder}/${zipSafeName(delegate.delegateNumber)}.png`,
      });
    }
  }

  void archive.finalize();
  return {
    stream,
    fileName: `${zipSafeName(deanery.name)}-Deanery-Badges.zip`,
    deaneryName: deanery.name,
    parishCount: deanery.parishes.length,
    delegateCount,
  };
}
