import { Router } from "express";
import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import {  getBadge,
        downloadBadge,
        downloadMyParishBadges,
        downloadAdminParishBadges
       } from "./badge.controller";
import * as badgeController from "./badge.controller";

const router = Router();


router.get(
  "/parish-badge/download",
  authenticate,
  downloadMyParishBadges
);


router.get("/:delegateId", getBadge);

router.get(
  "/verify/:token",
  badgeController.verifyBadges
);

router.get(
  "/:delegateId/download",
  downloadBadge
);

router.get(
  "/admin/parish/:parishId/download",
  authenticate,
  downloadAdminParishBadges
);


export default router;