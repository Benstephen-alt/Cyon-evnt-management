import { Router } from "express";

import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";

import { createHostel, 
         getHostels,
         getHostelById,
         updateHostel,
         deleteHostel,
       } from "./hostels.controller";

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  createHostel
);

router.get(
  "/hostel",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getHostels
);

router.get(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getHostelById
);

router.put(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateHostel
);

router.delete(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  deleteHostel
);

export default router;