import { Router } from "express";

import * as incomeController from "./income.controller";

import { authenticate } from "@/shared/utils/middlewares/auth.middleware";

import { authorize } from "@/shared/utils/middlewares/role.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(authenticate);

/*
|--------------------------------------------------------------------------
| View Income Records
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authorize(
    "SUPER_ADMIN",
    "ADMIN",
   
  ),
  incomeController.createIncomeRecord
);


router.get(
  "/incomes",
  authorize(
    "SUPER_ADMIN",
    "ADMIN",
    
  ),
  incomeController.getIncomeRecords
);

router.get(
  "/statistics",
  authorize(
    "ADMIN",
    "SUPER_ADMIN"
  ),
  incomeController.getIncomeStatistics
);

router.get(
  "/:id",
  authorize(
    "SUPER_ADMIN",
    "ADMIN",
    
  ),
  incomeController.getIncomeRecordById
);

/*
|--------------------------------------------------------------------------
| Create Income
|--------------------------------------------------------------------------
*/



/*
|--------------------------------------------------------------------------
| Update Income
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  authorize(
    "SUPER_ADMIN"
  ),
  incomeController.updateIncomeRecord
);

/*
|--------------------------------------------------------------------------
| Delete Income
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authorize("SUPER_ADMIN"),
  incomeController.deleteIncomeRecord
);

export default router;