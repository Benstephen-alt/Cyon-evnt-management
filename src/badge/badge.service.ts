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

dotenv.config();

export async function generateBadge(delegateId: string) {
  const delegate = await prisma.delegate.findUnique({
    where: {
        id: delegateId,
    },
    include: {
        event: true,
    },
});

  if (!delegate) {
    throw new Error("Delegate not found.");
  }

  // Generate QR Code
  const token = jwt.sign(
  {
    delegateNumber: delegate.delegateNumber,
    eventYear: delegate.event.year,
  },
  process.env.JWT_SECRET!,
  {
    expiresIn: "365d",
  }
);

const verificationUrl = `http://localhost:5000/api/badges/verify/${token}`;

const qrBuffer = await QRCode.toBuffer(verificationUrl, {
  width: 500,
  margin: 1,
});

  // Create SVG text
  const nameSvg = createSvgText({
    text: delegate.fullName,
    width: BADGE_CONFIG.name.width,
    fontSize: BADGE_CONFIG.name.fontSize,
    color: BADGE_CONFIG.name.color,
  });

  const parishSvg = createSvgText({
    text: wrapParishName(delegate.parishName),
    width: BADGE_CONFIG.parish.width,
    fontSize: BADGE_CONFIG.parish.fontSize,
    color: BADGE_CONFIG.parish.color,
  });

  const idSvg = createSvgText({
    text: delegate.delegateNumber,
    width: BADGE_CONFIG.delegateId.width,
    fontSize: BADGE_CONFIG.delegateId.fontSize,
    color: BADGE_CONFIG.delegateId.color,
  });

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
  let payload: any;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new Error("Invalid or expired QR code.");
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