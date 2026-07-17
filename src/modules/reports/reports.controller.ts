import { NextFunction, Request, Response } from "express";
import * as reportsService from "./reports.service";
import { exportToCSV } from "../../shared/utils/csvExport";

export async function getExecutiveDashboard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await reportsService.getExecutiveDashboard();

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function exportDelegatesCSV(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rows =
      await reportsService.exportDelegatesCSV();

    exportToCSV(
      res,
      "delegates.csv",
      rows
    );
  } catch (error) {
    next(error);
  }
}

export async function exportAccommodationCSV(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rows =
      await reportsService.exportAccommodationCSV();

    exportToCSV(
      res,
      "accommodation-report.csv",
      rows
    );
  } catch (error) {
    next(error);
  }
}

export async function exportFinanceCSV(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rows = await reportsService.exportFinanceCSV();

    exportToCSV(
      res,
      "finance-report.csv",
      rows
    );
  } catch (error) {
    next(error);
  }
}

export async function getDelegateReport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const report = await reportsService.getDelegateReport();

    return res.json({
      success: true,
      message: "Delegate report retrieved successfully.",
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAccommodationReport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const report = await reportsService.getAccommodationReport();

    return res.json({
      success: true,
      message: "Accommodation report retrieved successfully.",
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFinanceReport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const report = await reportsService.getFinanceReport();

    return res.json({
      success: true,
      message: "Finance report retrieved successfully.",
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export async function getParishReport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await reportsService.getParishReport();

    return res.json({
      success: true,
      message: "Parish report retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function exportParishCSV(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rows = await reportsService.exportParishCSV();

    exportToCSV(
      res,
      "parishes-report.csv",
      rows
    );
  } catch (error) {
    next(error);
  }
}