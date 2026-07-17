import { Router } from "express";

import * as financeController from "./finance.controller";

import {
  authenticate,
  authorizePermission,
  authorize
} from "../../shared/utils/middlewares";

import { CommitteePermission } from "@prisma/client";

const router = Router();

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/finance-dashboard",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_FINANCE_DASHBOARD
  ),
  financeController.getFinanceDashboard
);

/*
|--------------------------------------------------------------------------
| Budgets
|--------------------------------------------------------------------------
*/

router.post(
  "/create-budgets",
  authenticate,
  authorizePermission(
    CommitteePermission.CREATE_BUDGET
  ),
  financeController.createBudget
);

router.get(
  "/get-budgets",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_FINANCE_DASHBOARD
  ),
  financeController.getBudgets
);

router.patch(
  "/update-budget",
  authenticate,
  authorizePermission(
    CommitteePermission.UPDATE_BUDGET
  ),
  financeController.updateBudget
);

router.delete(
  "/delete-budgets/:id",
  authenticate,
  authorizePermission(
    CommitteePermission.DELETE_BUDGET
  ),
  financeController.deleteBudget
);


router.post(
  "/fund-releases",
  authenticate,
  authorizePermission(
    CommitteePermission.CREATE_FUND_RELEASE
  ),
  financeController.createFundRelease
);

router.get(
  "/get-fund-releases",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_FUND_RELEASES
  ),
  financeController.getFundReleases
);

router.get(
  "/fund-releases-id/:id",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_FUND_RELEASES
  ),
  financeController.getFundReleaseById
);

router.delete(
  "/delete-fund-releases/:id",
  authenticate,
  authorizePermission(
    CommitteePermission.DELETE_FUND_RELEASE
  ),
  financeController.deleteFundRelease
);

router.post(
  "/:committeeId/expensess",
  authenticate,
  authorizePermission(
    CommitteePermission.CREATE_EXPENSE
  ),
  financeController.createCommitteeExpense
);

router.get(
  "/get-expenses",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_EXPENSES
  ),
  financeController.getExpenses
);


router.patch(
  "/expenses/:id",
  authenticate,
  authorizePermission(
    CommitteePermission.UPDATE_EXPENSE
  ),
  financeController.updateExpense
);



router.get(
  "/expenses-byid/:id",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_EXPENSES
  ),
  financeController.getExpenseById
);



router.delete(
  "/delete-expenses/:id",
  authenticate,
  authorizePermission(
    CommitteePermission.DELETE_EXPENSE
  ),
  financeController.deleteExpense
);

router.get(
  "/system-income",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_FINANCE_DASHBOARD
  ),
  financeController.getSystemIncome
);

router.get(
  "/executive-payments",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_FINANCE_DASHBOARD
  ),
  financeController.getExecutivePayments
);

router.get(
  "/account-summary",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_FINANCE_DASHBOARD
  ),
  financeController.getAccountSummary
);

router.get(
  "/committee-finance-dashboard/:committeeId",
  authenticate,
  authorizePermission(
    CommitteePermission.VIEW_FINANCE_DASHBOARD
  ),
  financeController.getCommitteeFinanceDashboard
); 


router.get(
  "/options",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  financeController.getCommitteeOptions
);


router.get(
  "/:committeeId/members",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  financeController.getCommitteeMembers
);


router.get(
  "/committee/member-dashboard/:committeeId",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  financeController.getCommitteeMemberDashboard
);

export default router;