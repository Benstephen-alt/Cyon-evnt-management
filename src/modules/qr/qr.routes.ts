import { Router } from "express";

import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";
import { authorizePermission } from "@/shared/utils/middlewares/permission.middleware";
import { CommitteePermission } from "@prisma/client";

import { generateParishQr,
         generateParishQrImage,
         scanParishQr,
         confirmParishArrival,
         generateDelegateQr,
         generateDelegateQrImage,
          scanDelegateQr,
          checkInDelegate,
          getMyParishQr,
       } from "./qr.controller";

const router = Router();


router.get(
  "/parish/me/qrcode",
  authenticate,
  authorize("PARISH"),
  getMyParishQr
);

router.get(
  "/parishqr/:parishId/image",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  generateParishQrImage
);


router.get(
  "/parishqr/:parishId",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  generateParishQr
);

router.post(
  "/scan/parishqr",
  authenticate,
  authorizePermission(
    CommitteePermission.SCAN_PARISH
  ),
  scanParishQr
);

router.post(
  "/scan/delegateqr",
  authenticate,
  authorizePermission(
    CommitteePermission.SCAN_DELEGATE
  ),
  scanDelegateQr
);

router.post(
  "/scan/parishqr/confirm",
  authenticate,
  authorizePermission(
    CommitteePermission.CONFIRM_PARISH_ARRIVAL
  ),
  confirmParishArrival
);

router.get(
  "/delegateqr/:delegateId",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  generateDelegateQr
);

router.get(
  "/delegateqr/:delegateId/image",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  generateDelegateQrImage
);

router.post(
  "/scan/delegateqr/check-in",
  authenticate,
  authorizePermission(
    CommitteePermission.CHECKIN_DELEGATE
  ),
  checkInDelegate
);

export default router;