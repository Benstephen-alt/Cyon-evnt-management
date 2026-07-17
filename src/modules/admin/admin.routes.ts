

import { Router } from "express";

import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";

import {
  getParishes,
  getParishById,
  rejectParish,
  getDashboard,
  lockDelegateSubmission,
  unlockDelegateSubmission,
  regenerateAccessCode,
  resetAccessCode,
  getDelegates,
getDelegateById,
getDelegatesByParish,
deleteDelegate,
getAdminParishes,
getParishDetailsController,
getPendingRegistrationsController,
approveRegistrations,
getParishDashboard
} from "./admin.controller";


import {
  createAdmin,
  getAdmins,
  updateAdmin,
  disableAdmin,
  enableAdmin,
  resetAdminPassword,
} from "./services/admin-manager.controller";

const router = Router();


/**
 * Dashboard
 * 
 */


router.get(
  "/get-admins",
  authenticate,
  authorize("SUPER_ADMIN"),
  getAdmins
);


router.get(
  "/admin-dashboard",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getDashboard
);


router.get(
  "/pending",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getPendingRegistrationsController
);

router.get(
  "/adminpr-dashboard",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getParishDashboard
);

/**
 * Parish List
 */







router.get(
  "/parishes",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getParishes
);






/**
 * Single Parish
 */
router.get(
  "/parishes/:parishId",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getParishById
);

/**
 * Approve Parish
 */


router.put(
  "/:parishId/approve",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  approveRegistrations,
);




/**
 * Reject Parish
 */
router.put(
  "/parishes/:parishId/reject",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  rejectParish
);

/**
 * Reset Access Code
 */
router.patch(
  "/parishes/:parishId/reset-access-code",
  authenticate,
  authorize("SUPER_ADMIN"),
  resetAccessCode
);

/**
 * Regenerate Access Code
 */
router.patch(
  "/parishes/:parishId/regenerate-access-code",
  authenticate,
  authorize("SUPER_ADMIN"),
  regenerateAccessCode
);

/**
 * Lock Delegate Submission
 */
router.patch(
  "/parishes/:parishId/lock",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  lockDelegateSubmission
);

/**
 * Unlock Delegate Submission
 */
router.patch(
  "/parishes/:parishId/unlock",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  unlockDelegateSubmission
);

/**
 * Delegates
 */
router.get(
  "/delegates",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getDelegates
);


router.get(
  "/delegates/:delegateId",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getDelegateById
);


router.get(
  "/parishes/:parishId/delegates",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getDelegatesByParish
);



router.delete(
  "/del-delegates/:delegateId",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  deleteDelegate
);

router.get(
  "/parish-admin",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getAdminParishes
);






router.get(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getParishDetailsController
);





/*
|--------------------------------------------------------------------------
| Administrator Management
|--------------------------------------------------------------------------
*/

/**
 * List Administrators
 */


/**
 * Create Administrator
 */
router.post(
  "/admins-create",
  authenticate,
  authorize("SUPER_ADMIN"),
  createAdmin
);

/**
 * Update Administrator
 */
router.patch(
  "/admins/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  updateAdmin
);

/**
 * Disable Administrator
 */
router.patch(
  "/admins/:id/disable",
  authenticate,
  authorize("SUPER_ADMIN"),
  disableAdmin
);

/**
 * Enable Administrator
 */
router.patch(
  "/admins/:id/enable",
  authenticate,
  authorize("SUPER_ADMIN"),
  enableAdmin
);

/**
 * Reset Password
 */
router.patch(
  "/admins/:id/reset-password",
  authenticate,
  authorize("SUPER_ADMIN"),
  resetAdminPassword
);







export default router;