import { Request, Response } from "express";
import * as hostelService from "./hostel.service";

export async function createHostel(
  req: Request,
  res: Response
) {
  try {
    const result = await hostelService.createHostel(req.body);

    return res.status(201).json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getHostels(
  req: Request,
  res: Response
) {
  try {
    const result = await hostelService.getHostels();

    return res.json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getHostelById(
  req: Request,
  res: Response
) {
  try {
    const result = await hostelService.getHostelById(
      req.params.id as string
    );

    return res.json(result);

  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateHostel(
  req: Request,
  res: Response
) {
  try {
    const result = await hostelService.updateHostel(
      req.params.id as string,
      req.body
    );

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteHostel(
  req: Request,
  res: Response
) {
  try {
    const result = await hostelService.deleteHostel(
      req.params.id as string
    );

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}