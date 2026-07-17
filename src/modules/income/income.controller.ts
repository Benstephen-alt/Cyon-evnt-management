
import { Request, Response, NextFunction } from "express";

import * as incomeService from "./income.service";

import {
  CreateIncomeDto,
  UpdateIncomeDto,
} from "./income.types";


export async function createIncomeRecord(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const income =
      await incomeService.createIncomeRecord(
        req.body as CreateIncomeDto,
        req.user!.userId
      );

    return res.status(201).json(income);

  } catch (error) {
    next(error);
  }
}


export async function getIncomeRecords(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const incomes =
      await incomeService.getIncomeRecords();

    return res.json(incomes);

  } catch (error) {
    next(error);
  }
}


export async function getIncomeRecordById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const income =
      await incomeService.getIncomeRecordById(
        req.params.id as string
      );

    return res.json(income);

  } catch (error) {
    next(error);
  }
}


export async function updateIncomeRecord(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const income =
      await incomeService.updateIncomeRecord(
        req.params.id as string,
        req.body as UpdateIncomeDto
      );

    return res.json(income);

  } catch (error) {
    next(error);
  }
}


export async function deleteIncomeRecord(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await incomeService.deleteIncomeRecord(
        req.params.id as string
      );

    return res.json(result);

  } catch (error) {
    next(error);
  }
}


export async function getIncomeStatistics(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const statistics =
      await incomeService.getIncomeStatistics();

    return res.json(statistics);

  } catch (error) {
    next(error);
  }
}