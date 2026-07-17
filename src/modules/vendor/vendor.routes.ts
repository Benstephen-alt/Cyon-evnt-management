console.log("========== VENDOR ROUTES LOADED ==========");




import { Router } from "express";

import * as vendorController from "./vendor.controller";

import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";

const router = Router();



router.get(
  "/get-vendor",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  vendorController.getVendors
);


router.post(
  "/creates",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  vendorController.createVendor
);

router.get(
  "/:id/tag",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  vendorController.downloadVendorTag
);


router.put(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  vendorController.updateVendor
);

router.delete(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  vendorController.deleteVendor
);

export default router;