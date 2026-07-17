import { Router } from "express";

import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";
import { authorizePermission } from "@/shared/utils/middlewares/permission.middleware";
import { CommitteePermission } from "@prisma/client";

import {
  getParishArrivalSummary,
  markParishArrived,
   getArrivedParishes,
   getPendingParishes,
   getParishArrivalDashboard,
    generateParishQr,
} from "./parish-arrival.controller";

const router = Router();



router.get(
  "/arrival-dashboard",
  authenticate,
  authorizePermission(
    CommitteePermission.SCAN_PARISH
  ),
  getParishArrivalDashboard
);



router.post(
    "/:parishId/arrive",
    authenticate,
    authorizePermission(
        CommitteePermission.CONFIRM_PARISH_ARRIVAL
    ),
    markParishArrived
);

router.get(
    "/arrived",
    authenticate,
    authorizePermission(
        CommitteePermission.SCAN_PARISH
    ),
    getArrivedParishes
);

router.get(
    "/pending-arrival",
    authenticate,
    authorizePermission(
        CommitteePermission.SCAN_PARISH
    ),
    getPendingParishes
);



router.get(
  "/arrival-qr/:parishId",
  authenticate,
  authorize("ADMIN"),
  generateParishQr
);

router.get(
    "/:parishId",
    authenticate,
    authorizePermission(
        CommitteePermission.SCAN_PARISH
    ),
    getParishArrivalSummary
);

export default router;