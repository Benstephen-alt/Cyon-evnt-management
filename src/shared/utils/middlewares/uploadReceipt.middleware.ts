import multer from "multer";
import path from "path";
import fs from "fs";

const receiptDirectory = path.join(
  process.cwd(),
  "uploads",
  "receipts"
);

if (!fs.existsSync(receiptDirectory)) {
  fs.mkdirSync(receiptDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination(_, __, cb) {
    cb(null, receiptDirectory);
  },

  filename(_, file, cb) {
    const extension = path.extname(file.originalname);

    cb(
      null,
      `receipt-${Date.now()}${extension}`
    );
  },
});

function fileFilter(
  _: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(
      new Error(
        "Only JPG, PNG and PDF receipts are allowed."
      )
    );
  }

  cb(null, true);
}

export const uploadReceipt = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});