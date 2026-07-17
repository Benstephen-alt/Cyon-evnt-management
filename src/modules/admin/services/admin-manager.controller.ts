import { Request, Response } from "express";
import * as adminService from "./admin-manager.service";

/*
|--------------------------------------------------------------------------
| Create Administrator
|--------------------------------------------------------------------------
*/

export async function createAdmin(
  req: Request,
  res: Response
) {
  try {
    const result =
      await adminService.createAdmin(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Get Administrators
|--------------------------------------------------------------------------
*/

export async function getAdmins(
  req: Request,
  res: Response
) {
  try {
    const result =
      await adminService.getAdmins();

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Update Administrator
|--------------------------------------------------------------------------
*/

export async function updateAdmin(
  req: Request,
  res: Response
) {
  try {
    const result =
      await adminService.updateAdmin(
        req.params.id as string,
        req.body
      );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Disable Administrator
|--------------------------------------------------------------------------
*/

export async function disableAdmin(
  req: Request,
  res: Response
) {
  try {
    const currentUserId =
      req.user!.userId;

    const result =
      await adminService.disableAdmin(
        req.params.id as string,
        currentUserId
      );

    return res.status(200).json({
      success: true,
      message:
        "Administrator disabled successfully.",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Enable Administrator
|--------------------------------------------------------------------------
*/

export async function enableAdmin(
  req: Request,
  res: Response
) {
  try {
    const result =
      await adminService.enableAdmin(
        req.params.id as string
      );

    return res.status(200).json({
      success: true,
      message:
        "Administrator enabled successfully.",
      data: result,
    });
  } catch (error: any) {
    return res.status(200).json({
      success: false,
      message: error.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

export async function resetAdminPassword(
  req: Request,
  res: Response
) {
  try {
    const result =
      await adminService.resetAdminPassword(
        req.params.id as string
      );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}