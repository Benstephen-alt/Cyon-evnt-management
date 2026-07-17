import { Router } from "express";

import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";
import { CommitteePermission } from "@prisma/client";
import { authorizePermission } from "@/shared/utils/middlewares/permission.middleware";

import { createAccommodation, 
          getAccommodations,
          getAccommodationById,
           moveAccommodation,
           removeAccommodation,
           getAccommodationHostels,
           getAccommodationHostelById
       } from "./accommodation.controller";

const router = Router();

router.post(
    "/",
    authenticate,
    authorizePermission(
        CommitteePermission.ALLOCATE_ACCOMMODATION
    ),
    createAccommodation
);

router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getAccommodations
);

router.get(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getAccommodationById
);

router.patch(
    "/:id/move",
    authenticate,
    authorizePermission(
        CommitteePermission.MOVE_ACCOMMODATION
    ),
    moveAccommodation
);

router.delete(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  removeAccommodation
);

router.get(
  "/committee/accommodation/hostels",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getAccommodationHostels
);

router.get(
  "/committee/accommodation/hostels/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getAccommodationHostelById
);

export default router;