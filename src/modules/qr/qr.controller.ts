import { Request, Response } from "express";
import * as qrService from "./qr.service";

export async function generateParishQr(
  req: Request,
  res: Response
) {
  try {
    const result = await qrService.generateParishQr(
      req.params.parishId as string
    );

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


export async function generateParishQrImage(
  req: Request,
  res: Response
) {
  try {
    const result =
      await qrService.generateParishQrImage(
        req.params.parishId as string
      );

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function scanParishQr(
  req: Request,
  res: Response
) {
  try {
    const result =
      await qrService.scanParishQr(
        req.body.token
      );

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function confirmParishArrival(
  req: Request,
  res: Response
) {
  try {
    const result =
      await qrService.confirmParishArrival(
        req.body.token,
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

export async function generateDelegateQr(
  req: Request,
  res: Response
) {
  try {
    const result =
      await qrService.generateDelegateQr(
        req.params.delegateId as string
      );

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function generateDelegateQrImage(
  req: Request,
  res: Response
) {
  try {
    const result =
      await qrService.generateDelegateQrImage(
        req.params.delegateId as string
      );

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function scanDelegateQr(
  req: Request,
  res: Response
) {
  try {
    const result =
      await qrService.scanDelegateQr(
        req.body.token
      );

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function checkInDelegate(
  req: Request,
  res: Response
) {
  try {
    const result = await qrService.checkInDelegate(
      req.body.token,
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


export async function getMyParishQr(
  req: Request,
  res: Response
) {
  try {
    const result =
      await qrService.generateLoggedInParishQrImage(
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