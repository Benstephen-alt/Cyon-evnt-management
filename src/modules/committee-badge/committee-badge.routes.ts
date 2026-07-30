import { Router } from "express";
import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";
import { uploadCommitteePhoto } from "@/shared/utils/middlewares/uploadCommitteePhoto.middleware";
import * as controller from "./committee-badge.controller";

const router = Router();

router.use(
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN")
);

router.get("/options", controller.getBadgeOptions);
router.get("/", controller.listCommitteeBadges);
router.post(
  "/",
  uploadCommitteePhoto.single("photo"),
  controller.createCommitteeBadge
);
router.get("/:badgeId", controller.getCommitteeBadge);
router.patch(
  "/:badgeId",
  uploadCommitteePhoto.single("photo"),
  controller.updateCommitteeBadge
);
router.delete("/:badgeId", controller.deleteCommitteeBadge);
router.get("/:badgeId/image", controller.getCommitteeBadgeImage);
router.get(
  "/:badgeId/download",
  controller.downloadCommitteeBadge
);

export default router;
