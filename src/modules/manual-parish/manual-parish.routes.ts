import { Router } from "express";

import {
  searchParishes,
  registerManualParish,
  getManualRegistrations,
  getManualRegistrationById,
  updateManualRegistration,
  deleteManualRegistration,
  allocateManualParishAccommodation,
} from "./manual-parish.controller";


import { authenticate, authorize } from "@/shared/utils/middlewares";


const router = Router();



router.get("/", 
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getManualRegistrations);

router.get("/search",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  searchParishes);

router.post("/register", 
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  registerManualParish);

router.post("/:id/allocate-accommodation",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  allocateManualParishAccommodation);

router.get("/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getManualRegistrationById);

router.put("/:id", 
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateManualRegistration);

router.delete("/:id", 
  authenticate,
  authorize("SUPER_ADMIN"),
  deleteManualRegistration);

export default router;
