import { authenticate, authorize } from "@/shared/utils/middlewares";
import { Router } from "express";
import * as securityController from "./security.controller"


const router = Router();


router.post(
  "/delegate/go-out",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  securityController.allowDelegateToGoOut
);

router.post(
  "/delegate/return",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  securityController.markDelegateReturned
);

router.get(
  "/delegate/:delegateNumber",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),

  securityController.searchDelegate
);

router.get(
  "/outside",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  securityController.getDelegatesOutside
);


router.get(
  "/manual/:registrationCode",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  securityController.searchManualParish
);


export default router;