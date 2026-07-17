import jwt from "jsonwebtoken";

const QR_TOKEN_EXPIRES_IN = "365d";

export interface DelegateQrPayload {
  type: "DELEGATE";
  delegateNumber: string;
  eventYear: number;
}

export interface ParishQrPayload {
  type: "PARISH";
  parishId: string;
  eventYear: number;
}

export type QrPayload = DelegateQrPayload | ParishQrPayload;

export function generateQrToken(payload: QrPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: QR_TOKEN_EXPIRES_IN,
  });
}

export function verifyQrToken(token: string): QrPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as QrPayload;
}