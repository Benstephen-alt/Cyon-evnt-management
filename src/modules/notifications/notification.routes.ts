import { Router } from "express";
import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";
import { authorizeAdminPortal } from "@/shared/utils/middlewares/admin-portal.middleware";
import * as controller from "./notification.controller";

const router = Router();

router.use(
  authenticate,
  authorizeAdminPortal,
  authorize("SUPER_ADMIN", "ADMIN")
);
router.post("/preview", controller.preview);
router.post("/send", controller.send);
router.get("/", controller.list);
router.get("/:id", controller.getById);

export default router;
