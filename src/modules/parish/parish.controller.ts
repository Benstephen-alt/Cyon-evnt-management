import { Request, Response } from "express";
import * as parishService from "./parish.service";
import { RegisterParishDto } from "./dto/register-parish.dto";


export async function parishLogin(
  req: Request,
  res: Response
) {
  try {
    const result = await parishService.login(req.body);

    return res.json(result);

  } catch (error: any) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
}



export async function dashboard(
  req: Request,
  res: Response
) {
  try {
    const userId = (req as any).user.userId;

    const result =
      await parishService.getDashboard(userId);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function profile(
  req: Request,
  res: Response
) {
  try {
    const userId = (req as any).user.userId;

    const result =
      await parishService.getProfile(userId);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateProfile(
  req: Request,
  res: Response
) {
  try {
    const userId = (req as any).user.userId;

    const result =
      await parishService.updateProfile(
        userId,
        req.body
      );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


export async function registerParishController(
  req: Request,
  res: Response
) {
console.log("Authenticated user:", req.user);
  
  try {
    if (!req.user) {
      
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment receipt is required.",
      });
    }

    const data: RegisterParishDto = {
      presidentName: req.body.presidentName,
      presidentPhoneNumber: req.body.presidentPhoneNumber,
      receiptUrl: `/uploads/receipts/${req.file.filename}`,
    };

    await parishService.registerParish(
      req.user.userId,
      data
    );

    return res.status(200).json({
      success: true,
      message: "Registration submitted successfully.",
    });

  } catch (error: any) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
}


export async function checkApprovalStatusController(
  req: Request,
  res: Response
) {
  try {
    const  parishId  = req.params.parishId as string;

    const result =
      await parishService.checkApprovalStatus(
        parishId
      );

    return res.json(result);

  } catch (error: any) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
}

