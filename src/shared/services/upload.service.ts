import fs from "fs";
import path from "path";

const uploadRoot = path.join(process.cwd(), "uploads");

export function ensureUploadFolders() {
  const folders = [
    "delegates",
    "receipts",
    "events",
    "announcements",
    "temp",
  ];

  for (const folder of folders) {
    const fullPath = path.join(uploadRoot, folder);

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }
}