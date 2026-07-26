import { Request, Response, NextFunction } from "express";
import * as securityService from "./security.service"
import { AllowDelegateToGoOutDto, MarkDelegateReturnedDto } from "./security.types";





export async function searchDelegate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await securityService.searchDelegate(
        req.params.delegateNumber as string
      );

    res.json(result);
  } catch (error) {
    next(error);
  }
}


export async function allowDelegateToGoOut(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload =
      req.body as AllowDelegateToGoOutDto;

    const result =
      await securityService.allowDelegateToGoOut(
        payload,
        req.user!.userId
      );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function markDelegateReturned(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload =
      req.body as MarkDelegateReturnedDto;

    const result =
      await securityService.markDelegateReturned(
        payload,
        req.user!.userId
      );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getDelegatesOutside(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await securityService.getDelegatesOutside();

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}



export async function searchManualParish(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const registrationCode =
      req.params.registrationCode as string;

    const result =
      await securityService.searchManualParish(
        registrationCode
      );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}