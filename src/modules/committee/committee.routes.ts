import { Router } from "express";

import { authenticate } from "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";

import {
  createCommittee,
  getCommittees,
  getCommitteeById,
  updateCommittee,
  deleteCommittee,
   getAvailableCommitteeUsers
} from "./committee.controller";

import {
  createCommitteeMember,
  getCommitteeMembers,
  getCommitteeMemberById,
  updateCommitteeMember,
  deleteCommitteeMember,
 
} from "./committee-member.controller";

import {
  createCommitteeAssignment,
  getCommitteeAssignments,
  removeCommitteeAssignment,
  
} from "./committee-assignment.controller";

const router = Router();

/**
 * Committees
 */

router.get(
  "/available-users",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getAvailableCommitteeUsers
);

router.get(
  "/get-members",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getCommitteeMembers
);


router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  createCommittee
);

router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getCommittees
);

router.get(
  "/:committeeId",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getCommitteeById
);

router.patch(
  "/:committeeId",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateCommittee
);

router.delete(
  "/:committeeId",
  authenticate,
  authorize("SUPER_ADMIN"),
  deleteCommittee
);

/**
 * Committee Members
 */
router.post(
  "/create-members",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  createCommitteeMember
);



router.get(
  "/search-members/:memberId",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getCommitteeMemberById
);

router.patch(
  "/update-member/:memberId",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  updateCommitteeMember
);

router.delete(
  "/delete-member/:memberId",
  authenticate,
  authorize("SUPER_ADMIN"),
  deleteCommitteeMember
);

/**
 * Committee Assignments
 */
router.post(
  "/create-assignments",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  createCommitteeAssignment
);

router.get(
  "/get-assignments",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  getCommitteeAssignments
);

router.delete(
  "/remove-assignments/:assignmentId",
  authenticate,
  authorize("SUPER_ADMIN"),
  removeCommitteeAssignment
);

export default router;