import { Request, Response, NextFunction } from "express";

import * as financeService from "./finance.service";
import {
  createBudgetSchema,
  updateBudgetSchema,
  createFundReleaseSchema,
  createExpenseSchema,
  updateExpenseSchema,
  createCommitteeExpenseSchema
} from "./finance.validation";



interface CommitteeDashboardParams {
  committeeId: string;
}




export async function createBudget(
  req: Request,
  res: Response
) {
  const data =
    createBudgetSchema.parse(
      req.body
    );

  const result =
    await financeService.createBudget(
      data
    );

  return res.json(result);
}

export async function getBudgets(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await financeService.getBudgets();

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateBudget(
  req: Request,
  res: Response
) {
  const result =
    await financeService.updateBudget(
      req.body
    );

  return res.json(result);
}

export async function deleteBudget(
  req: Request<{id: string}>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await financeService.deleteBudget(
      req.params.id
    );

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getFinanceDashboard(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await financeService.getFinanceDashboard();

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function createFundRelease(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = createFundReleaseSchema.parse(req.body);

   const result =
  await financeService.createFundRelease(
    data,
    req.user!.userId
  );

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getFundReleases(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await financeService.getFundReleases();

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getFundReleaseById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await financeService.getFundReleaseById(
        req.params.id
      );

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteFundRelease(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await financeService.deleteFundRelease(
        req.params.id as string
      );

    return res.json(result);

  } catch (error) {
    next(error);
  }
}

export async function createCommitteeExpense(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data =
      createCommitteeExpenseSchema.parse(
        req.body
      );

    const result =
      await financeService.createCommitteeExpense(
        req.params.committeeId as string,
        req.user!.userId,
        data
      );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
      


export async function getExpenses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await financeService.getExpenses();

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getExpenseById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await financeService.getExpenseById(
        req.params.id
      );

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateExpense(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const data =
      updateExpenseSchema.parse(req.body);

    const result =
      await financeService.updateExpense(
        req.params.id,
        data
      );

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteExpense(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await financeService.deleteExpense(
        req.params.id
      );

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCommitteeFinanceDashboard(
  req: Request<{ committeeId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await financeService.getCommitteeFinanceDashboard(
        req.params.committeeId
      );

    return res.json(result);
  } catch (error) {
    next(error);
  }
}


export async function getSystemIncome(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    const result =
      await financeService.getSystemIncome();

    return res.json(result);

  } catch (error) {

    next(error);

  }
}

export async function getExecutivePayments(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await financeService.getExecutivePayments();

    return res.json(result);

  } catch (error) {

    next(error);

  }
}

export async function getAccountSummary(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await financeService.getAccountSummary();

    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
}

export async function getCommitteeOptions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await financeService.getCommitteeOptions();

    return res.json(result);

  } catch (error) {
    next(error);
  }
}


export async function getCommitteeMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await financeService.getCommitteeMembers(
        req.params.committeeId as string
      );

    return res.json(result);

  } catch (error) {
    next(error);
  }
}


export async function getCommitteeMemberDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  console.log(req.user);
  try {
    const result =
      await financeService.getCommitteeMemberDashboard(
        req.params.committeeId as string,
        req.user!.userId
      );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}