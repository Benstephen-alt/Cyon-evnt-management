import { Request, Response, NextFunction, response } from "express";

import * as vendorService from "./vendor.service";

import {
  createVendorSchema,
  updateVendorSchema,
} from "./vendor.validation";

export async function createVendor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data =
      createVendorSchema.parse(req.body);

    const result =
      await vendorService.createVendor(
        data,
        req.user!.userId
      );

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateVendor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data =
      updateVendorSchema.parse(req.body);

    const result =
      await vendorService.updateVendor(
        req.params.id as string,
        data
      );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getVendors(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await vendorService.getVendors();

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteVendor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await vendorService.deleteVendor(
        req.params.id as string
      );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}


export async function downloadVendorTag(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  console.log("downloadVendorTag controller");

  try {
    await vendorService.downloadVendorTag(
      req.params.id as string,
      res
    );
  } catch (error) {
    next(error);
  }
}