import { Router } from "express";
import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";
import { authorizePortal } from "@/shared/utils/middlewares/portal.middleware";
import { authorizeAdminPortal } from "@/shared/utils/middlewares/admin-portal.middleware";
import * as controller from "./feeding.controller";

const router = Router();
router.get("/committee", authenticate, authorizePortal("COMMITTEE"), controller.committeeDashboard);
router.post("/profile", authenticate, authorizePortal("COMMITTEE"), controller.createProfile);
router.post("/requests", authenticate, authorizePortal("COMMITTEE"), controller.createRequest);
router.get("/admin", authenticate, authorizePortal("ADMIN"), authorize("SUPER_ADMIN", "ADMIN"), authorizeAdminPortal, controller.adminDashboard);
router.patch("/admin/requests/:requestId", authenticate, authorizePortal("ADMIN"), authorize("SUPER_ADMIN", "ADMIN"), authorizeAdminPortal, controller.reviewRequest);
router.delete("/admin/requests", authenticate, authorizePortal("ADMIN"), authorize("SUPER_ADMIN"), authorizeAdminPortal, controller.clearRequestLogs);
export default router;
