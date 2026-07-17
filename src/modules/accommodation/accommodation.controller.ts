import { Request, Response } from "express";
import * as accommodationService from "./accommodation.service";

export async function createAccommodation(
  req: Request,
  res: Response
) {
  try {
    const result =
      await accommodationService.createAccommodation(
        req.body,
        req.user!.userId
      );

    return res.status(201).json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getAccommodations(
  req: Request,
  res: Response
) {
  try {
    const result =
      await accommodationService.getAccommodations();

    return res.json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getAccommodationById(
  req: Request,
  res: Response
) {
  try {
    const result =
      await accommodationService.getAccommodationById(
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

export async function moveAccommodation(
  req: Request,
  res: Response
) {
  try {
    const result =
      await accommodationService.moveAccommodation(
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

export async function removeAccommodation(
  req: Request,
  res: Response
) {
  try {
    const result =
      await accommodationService.removeAccommodation(
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

export async function getAccommodationHostels(
  req: Request,
  res: Response
) {
  try {
    const result =
      await accommodationService.getAccommodationHostels();

    return res.json(result);

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}

export async function getAccommodationHostelById(
  req: Request,
  res: Response
) {

  try {

    const result =
      await accommodationService.getAccommodationHostelById(
        req.params.id as string
      );

    return res.json(result);

  } catch (error: any) {

    return res.status(404).json({

      success: false,

      message:
        error.message,

    });

  }

}