import { Router } from "express";
import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { uploadReceipt } from "@/shared/utils/middlewares/uploadReceipt.middleware";

import { authorize } from "@/shared/utils/middlewares/role.middleware";
import { parishLogin,
          dashboard,
           profile,
           updateProfile,
            registerParishController,
       } from "./parish.controller";

const router = Router();

router.post("/login", parishLogin);


router.post(
  "/register-parish",
  authenticate,
  authorize("PARISH"),
  uploadReceipt.single("receipt"),
  registerParishController
);

router.get(
  "/parish-dashboard",
  authenticate,
  dashboard
);

router.get(
  "/parish-profile",
  authenticate,
  authorize("PARISH"),
  profile
);

router.patch(
  "/update-profile",
  authenticate,
  authorize("PARISH"),
  updateProfile
);





export default router;