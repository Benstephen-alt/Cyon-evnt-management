import { NextFunction, Request, Response } from "express";
import { AppError } from "@/shared/errors/AppError";
import * as service from "./feeding.service";

export async function committeeDashboard(req: Request, res: Response, next: NextFunction) {
  try { res.json(await service.getCommitteeDashboard(req.user!.userId)); } catch (error) { next(error); }
}
export async function createProfile(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await service.createProfile(req.user!.userId, req.body)); } catch (error) { next(error); }
}
export async function createRequest(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await service.requestFeeding(req.user!.userId)); } catch (error) { next(error); }
}
export async function createSecurityRequest(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await service.requestSecurityFeeding(req.user!.userId)); } catch (error) { next(error); }
}
export async function adminDashboard(_req: Request, res: Response, next: NextFunction) {
  try { res.json(await service.getAdminDashboard()); } catch (error) { next(error); }
}
export async function reviewRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const status = String(req.body.status ?? "").toUpperCase();
    if (status !== "APPROVED" && status !== "REJECTED") {
      throw new AppError(400, "Status must be APPROVED or REJECTED.", "VALIDATION_ERROR");
    }
    res.json(await service.reviewRequest(req.params.requestId as string,
      req.user!.userId, status, req.body.rejectionReason));
  } catch (error) { next(error); }
}

export async function clearRequestLogs(_req: Request, res: Response, next: NextFunction) {
  try { res.json(await service.clearRequestLogs()); } catch (error) { next(error); }
}
