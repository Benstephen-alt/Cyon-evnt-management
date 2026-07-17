import { Request, Response } from "express";
import * as adminService from "./services";
import { getAllParishesForAdmin,
          getParishDetails,
  } from "./services"



export async function getParishes(
  req: Request,
  res: Response
) {
  try {
    const parishes = await adminService.getParishes();

    return res.json({
      success: true,
      total: parishes.length,
      data: parishes,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getParishById(
  req: Request,
  res: Response
) {
  try {
    const parish = await adminService.getParishById(
      req.params.parishId as string
    );

    return res.json({
      success: true,
      message: "Parish retrieved successfully.",
      data: parish,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}



export async function rejectParish(
  req: Request,
  res: Response
) {
  try {
    const parish = await adminService.rejectParish(
      req.params.parishId as string
    );

    return res.json({
      success: true,
      message: "Parish registration rejected successfully.",
      data: parish,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function lockDelegateSubmission(
  req: Request,
  res: Response
) {
  try {
    const result =
      await adminService.lockDelegateSubmission(
        req.params.parishId as string
      );

    return res.json({
      success: true,
      message: "Delegate submission locked successfully.",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function unlockDelegateSubmission(
  req: Request,
  res: Response
) {
  try {
    const result =
      await adminService.unlockDelegateSubmission(
        req.params.parishId as string
      );

    return res.json({
      success: true,
      message: "Delegate submission unlocked successfully.",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function regenerateAccessCode(
  req: Request,
  res: Response
) {
  try {
    const result =
      await adminService.regenerateAccessCode(
        req.params.parishId as string
      );

    return res.json({
      success: true,
      message: "Access code regenerated successfully.",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function resetAccessCode(
  req: Request,
  res: Response
) {
  try {
    const result =
      await adminService.resetAccessCode(
        req.params.parishId as string
      );

    return res.json({
      success: true,
      message: "Access code reset successfully.",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getDashboard(
  req: Request,
  res: Response
) {
  try {
    const dashboard =
      await adminService.getDashboard();

    return res.json({
      success: true,
      data: dashboard,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getDelegates(
  req: Request,
  res: Response
) {
  try {
    const delegates = await adminService.getDelegates({
      search: req.query.search as string,
      parishId: req.query.parishId as string,
      deaneryId: req.query.deaneryId as string,
      gender: req.query.gender as string,
    });

    return res.json({
      success: true,
      total: delegates.length,
      data: delegates,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getDelegateById(
  req: Request,
  res: Response
) {
  try {
    const delegate =
      await adminService.getDelegateById(
        req.params.delegateId as string
      );

    return res.json({
      success: true,
      data: delegate,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getDelegatesByParish( 
  req: Request,
  res: Response
) {
  try {
    const delegates =
      await adminService.getDelegatesByParish(
        req.params.parishId as string
      );

    return res.json({
      success: true,
      data: delegates,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteDelegate(
  req: Request,
  res: Response
) {
  try {
    const result =
      await adminService.deleteDelegate(
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


export async function getAdminParishes(
  req: Request,
  res: Response
) {
  try {
    const parishes = await getAllParishesForAdmin();

    return res.status(200).json({
      success: true,
      parishes,
      summary: {
        totalParishes: parishes.length,
        registeredParishes: parishes.filter(
          (parish) => parish.registered
        ).length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getParishDetailsController(
  req: Request,
  res: Response
) {
  try {
    const result = await getParishDetails(
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



export async function getPendingRegistrationsController(
  req: Request,
  res: Response
) {
  try {
    const result =
      await adminService.getPendingRegistrations();

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


export async function approveRegistrations(
  req: Request,
  res: Response
) {

console.log("Params:", req.params);

  try {
    await adminService.approveParishRegistrations(
      req.params.parishId as string,
      req.user!.userId
    );

    return res.json({
      success: true,
      message: "Parish approved successfully.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getParishDashboard(
  req: Request,
  res: Response
) {
  try {
    const data = await adminService.getParishDashboards();

    return res.json({
      success: true,
      summary: data.summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load parish dashboard.",
    });
  }
}




