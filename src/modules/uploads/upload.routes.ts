import { Router } from "express";
import multer from "multer";

import {
  authenticate,
} from "@/shared/utils/middlewares/auth.middleware";

import {
  uploadExpenseReceipt,
} from "./upload.controller";

const router = Router();

const upload = multer({
  dest: "uploads/temp",
});

router.post(
  "/upload-receipt",
  authenticate,
  upload.single("receipt"),
  uploadExpenseReceipt
);

export default router;