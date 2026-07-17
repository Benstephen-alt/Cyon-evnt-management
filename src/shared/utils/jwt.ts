import jwt, { Secret, SignOptions } from "jsonwebtoken";


export interface JwtPayload {
  userId: string;
  role: string;
}

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "7d") as SignOptions["expiresIn"];

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}


export function generateQrToken(payload: object): string {
  return jwt.sign(
    payload,
    process.env.QR_SECRET!,
    {
      expiresIn: "365d",
    }
  );
}


export function verifyQrToken(token: string): any {
  return jwt.verify(
    token,
    process.env.QR_SECRET!
  );
}