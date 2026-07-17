import { Request, Response } from "express";
import path from "path";
import fs from "fs";

import {
  buildExpenseReceiptPath,
} from "@/shared/utils/upload-path";

export async function uploadExpenseReceipt(
  req: Request,
  res: Response
): Promise<void> {

  if (!req.file) {
    res.status(400).json({
      success: false,
      message: "Receipt is required.",
    });

    return;
  }

  const uploadsDir = path.join(
    process.cwd(),
    "uploads",
    "receipts"
    
  );

  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });

  const extension =
    path.extname(req.file.originalname);

  const filename =
    `${Date.now()}${extension}`;

  const destination =
    path.join(
      uploadsDir,
      filename
    );

  fs.renameSync(
    req.file.path,
    destination
  );

  res.json({
    success: true,
    url: buildExpenseReceiptPath(
      filename
    ),
  });
}