import { Request, Response } from "express";
import * as hallService from "./hall.service";

export async function createHall(
  req: Request,
  res: Response
) {
  try {
    const result = await hallService.createHall(req.body);

    return res.status(201).json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getHalls(
  req: Request,
  res: Response
) {
  try {
    const result = await hallService.getHalls();

    return res.json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getHallById(
  req: Request,
  res: Response
) {
  try {
    const result = await hallService.getHallById(
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

export async function updateHall(
  req: Request,
  res: Response
) {
  try {
    const result = await hallService.updateHall(
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

export async function deleteHall(
  req: Request,
  res: Response
) {
  try {
    const result = await hallService.deleteHall(
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