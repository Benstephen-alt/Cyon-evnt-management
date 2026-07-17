
import { Router } from "express";

import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";

import { createEvent, 
          getEvents,
        getEventById,
         updateEvent,
          activateEvent,
          updateRegistrationStatus,
          getActiveEvent
        } from "./event.controller";

const router = Router();

router.use((req, res, next) => {
  console.log("EVENT ROUTER:", req.method, req.originalUrl);
  next();
});


router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  createEvent
);

router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN", ),
  getEvents
);

router.get(
  "/active",
  getActiveEvent
);

router.get(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN",),
  getEventById
);

router.put(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateEvent
);

router.put(
  "/:id/activate",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  activateEvent
);

router.put(
  "/:id/registration",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateRegistrationStatus
);

export default router;