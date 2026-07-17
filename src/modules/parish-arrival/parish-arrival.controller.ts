import { Request, Response } from "express";
import * as parishArrivalService from "./parish-arrival.service";


export async function getParishArrivalSummary(
  req: Request,
  res: Response
) {
  try {
    const result =
      await parishArrivalService.getParishArrivalSummary(
        req.params.parishId as string
      );

    return res.json(result);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function markParishArrived(
  req: Request,
  res: Response
) {
  try {
    const result =parishArrivalService
      await parishArrivalService.markParishArrived(
        req.params.parishId as string,
        req.user!.userId
      );

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getArrivedParishes(
  _req: Request,
  res: Response
) {
  try {
    const result =
      await parishArrivalService.getArrivedParishes();

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getPendingParishes(
  _req: Request,
  res: Response
) {
  try {
    const result =
      await parishArrivalService.getPendingParishes();

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getParishArrivalDashboard(
  _req: Request,
  res: Response
) {
  try {
    const result =
      await parishArrivalService.getParishArrivalDashboard();

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function generateParishQr(
  req: Request,
  res: Response
) {
  try {
    const  parishId  = req.params.parishId as string;

    const qr = await parishArrivalService.generateParishQr(parishId);

    res.setHeader("Content-Type", "image/png");
    res.send(qr);

  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}


