import { Router } from "express";
import * as reportsController from "./reports.controller";

import {
  authenticate,
  authorizePermission,
} from "../../shared/utils/middlewares";

import { CommitteePermission } from "@prisma/client";

const router = Router();

router.get(
  "/report-dashboard",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_REPORTS
  ),
  reportsController.getExecutiveDashboard
);

router.get(
  "/delegates-report/export",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_REPORTS
  ),
  reportsController.exportDelegatesCSV
);

router.get(
  "/accommodation-report/export",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_REPORTS
  ),
  reportsController.exportAccommodationCSV
);

router.get(
  "/finance-report/export",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_REPORTS
  ),
  reportsController.exportFinanceCSV
);

router.get(
  "/delegates-report",
  authenticate,
  authorizePermission(CommitteePermission.VIEW_REPORTS),
  reportsController.getDelegateReport
);

router.get(
  "/accommodation-report",
  authenticate,
  authorizePermission(CommitteePermission.VIEW_REPORTS),
  reportsController.getAccommodationReport
);

router.get(
  "/finance-report",
  authenticate,
  authorizePermission(CommitteePermission.VIEW_REPORTS),
  reportsController.getFinanceReport
);

router.get(
  "/parishes-report",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_REPORTS
  ),
  reportsController.getParishReport
);

router.get(
  "/parishes-report/export",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_REPORTS
  ),
  reportsController.exportParishCSV
);

export default router;