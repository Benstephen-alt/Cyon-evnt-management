import { Router } from "express";

import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";

import { createHall, 
         getHalls,
          getHallById,
          updateHall,
          deleteHall,
       } from "./hall.controller";

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  createHall
);

router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getHalls
);

router.get(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getHallById
);

router.put(
  "/update/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateHall
);

router.delete(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  deleteHall
);

export default router;