import { Router } from "express";
import {
  createDelegate,
  getDelegates,
   getDelegate,
   updateDelegate,
    deleteDelegate,
   getParishDelegates,
    uploadDelegatePhotoController
} from "./delegate.controller";

import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";
import { uploadDelegatePhoto } from "@/shared/utils/middlewares/upload.maddleware";

const router = Router();

router.get("/", authenticate, authorize("PARISH"), getDelegates);

//router.get("/:id", authenticate, authorize("PARISH"), getDelegateById);


router.get(
  "/",
  authenticate,
  getParishDelegates
);



router.get(
  "/:delegateId",
  authenticate,
  authorize("PARISH"),
  getDelegate
);


router.post(
  "/upload-photo",
  authenticate,
  authorize("PARISH"),
  uploadDelegatePhoto.single("photo"),
  uploadDelegatePhotoController
);

router.post(
  "/",
  authenticate,
  authorize("PARISH"),
  uploadDelegatePhoto.single("photo"),
  createDelegate
);


router.delete(
  "/:id",
  authenticate,
  authorize("PARISH"),
  deleteDelegate
);

router.put(
  "/:id",
  authenticate,
  authorize("PARISH"),
  uploadDelegatePhoto.single("photo"),
  updateDelegate
);


export default router;