import fs from "fs";
import path from "path";
import multer from "multer";
import { randomUUID } from "crypto";
import { AppError } from "@/shared/errors/AppError";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "committee-members"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_req, file, callback) => {
    const extensionByMimeType: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    callback(
      null,
      `${randomUUID()}${extensionByMimeType[file.mimetype] ?? ""}`
    );
  },
});

export const uploadCommitteePhoto = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError(
          400,
          "Photo must be a JPEG, PNG, or WebP image.",
          "INVALID_PHOTO_TYPE"
        )
      );
      return;
    }

    callback(null, true);
  },
});
