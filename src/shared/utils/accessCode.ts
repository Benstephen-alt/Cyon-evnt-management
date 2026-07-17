import crypto from "crypto";

/**
 * Generates a unique parish access code.
 *
 * Example:
 * NSK-7F4K9P
 * NSK-X2M8QT
 * NSK-B9L3WR
 */
export function generateAccessCode(): string {
  const random = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return `NSK-${random}`;
}