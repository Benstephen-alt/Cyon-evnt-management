import { Router } from "express";
import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";
import { authorizePortal } from "@/shared/utils/middlewares/portal.middleware";
import { authorizeAdminPortal } from "@/shared/utils/middlewares/admin-portal.middleware";
import * as controller from "./super-admin.controller";

const router = Router();
router.use(authenticate, authorizePortal("ADMIN"), authorize("SUPER_ADMIN"), authorizeAdminPortal);
router.get("/parishes", controller.list);
router.patch("/parishes/:accountId/move", controller.move);
router.patch("/parishes/:accountId/restore", controller.restore);
export default router;
