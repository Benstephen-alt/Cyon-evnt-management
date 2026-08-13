import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import sharp from "sharp";
import prisma from "@/config/prisma";
import { AppError } from "@/shared/errors/AppError";
import { getActiveEvent } from "@/shared/services/event.service";
import { generateQrToken } from "@/shared/utils/jwt";
import { createSvgText } from "@/shared/utils/createSvgText";
import { PRIVATE_DELEGATE_BADGE_CONFIG as config } from "@/assets/private-delegate-badge.config";
import { PassThrough } from "stream";
const archiver = require("archiver");

function templatePath() {
  const paths = [path.resolve(process.cwd(), "dist/assets/private-delegate-badge-template.jpg"), path.resolve(process.cwd(), config.template)];
  const result = paths.find(fs.existsSync);
  if (!result) throw new AppError(500, "Private delegate badge template was not found.");
  return result;
}

export async function createPrivateDelegate(input: { fullName?: string; phoneNumber?: string; gender?: "MALE" | "FEMALE" }) {
  const fullName = String(input.fullName ?? "").trim();
  if (!fullName) throw new AppError(400, "Delegate name is required.");
  const event = await getActiveEvent();
  return prisma.$transaction(async (tx) => {
    const updated = await tx.event.update({ where: { id: event.id }, data: { privateDelegateSequence: { increment: 1 } }, select: { privateDelegateSequence: true } });
    const delegateNumber = `CYON-R${String(updated.privateDelegateSequence).padStart(2, "0")}`;
    return tx.privateDelegate.create({ data: { eventId: event.id, delegateNumber, fullName, phoneNumber: String(input.phoneNumber ?? "").trim() || null, gender: input.gender || null } });
  });
}

export async function listPrivateDelegates(search?: string) {
  const event = await getActiveEvent();
  const term = String(search ?? "").trim();
  return prisma.privateDelegate.findMany({ where: { eventId: event.id, ...(term ? { OR: [{ fullName: { contains: term, mode: "insensitive" } }, { delegateNumber: { contains: term, mode: "insensitive" } }] } : {}) }, orderBy: { createdAt: "desc" } });
}

export async function getPrivateDelegate(id: string) {
  const event = await getActiveEvent();
  const delegate = await prisma.privateDelegate.findFirst({ where: { id, eventId: event.id } });
  if (!delegate) throw new AppError(404, "Private delegate not found.");
  return delegate;
}

export async function deletePrivateDelegate(id: string) { await getPrivateDelegate(id); await prisma.privateDelegate.delete({ where: { id } }); }

export async function generatePrivateDelegateBadge(id: string) {
  const delegate = await getPrivateDelegate(id);
  const event = await getActiveEvent();
  const token = generateQrToken({ type: "PRIVATE_DELEGATE", privateDelegateId: delegate.id, delegateNumber: delegate.delegateNumber, eventYear: event.year });
  const [idText, qr] = await Promise.all([
    createSvgText({ text: delegate.delegateNumber, width: config.id.width, fontSize: config.id.fontSize, color: config.id.color }),
    QRCode.toBuffer(token, { width: 500, margin: 1 }),
  ]);
  const resizedQr = await sharp(qr).resize(config.qr.size, config.qr.size).png().toBuffer();
  return sharp(templatePath()).composite([{ input: idText, left: config.id.x, top: config.id.y }, { input: resizedQr, left: config.qr.x, top: config.qr.y }]).png().toBuffer();
}

export async function downloadAllPrivateDelegateBadges() {
  const delegates = await listPrivateDelegates();
  if (!delegates.length) throw new AppError(404, "No private delegate badges found for the active event.");
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = new PassThrough();
  archive.on("error", (error: Error) => stream.destroy(error));
  archive.pipe(stream);
  for (const delegate of [...delegates].sort((a, b) => a.delegateNumber.localeCompare(b.delegateNumber))) {
    archive.append(await generatePrivateDelegateBadge(delegate.id), { name: `${delegate.delegateNumber}.png` });
  }
  void archive.finalize();
  return { stream, fileName: "Private-Delegate-Badges.zip", count: delegates.length };
}
