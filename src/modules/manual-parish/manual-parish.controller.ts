import { Request, Response } from "express";
import * as manualParishService from "./manual-parish.service";

export const searchParishes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = String(req.query.query || "");

    const result = await manualParishService.searchParishes(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const registerManualParish = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.user!.userId;

    const result = await manualParishService.registerManualParish(
      req.body,
      adminId
    );

    res.status(201).json({
      success: true,
      message: "Manual parish registered successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const getManualRegistrations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await manualParishService.getManualRegistrations();

    res.status(200).json({
      success: true,
      data: result.registrations,
      summary: result.summary,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getManualRegistrationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const registration =
      await manualParishService.getManualRegistrationById(
        req.params.id as string
      );

    if (!registration) {
      res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateManualRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const {
      presidentName,
      presidentPhone,
      maleDelegates,
      femaleDelegates,
    } = req.body;

    const updatedRegistration =
      await manualParishService.updateManualRegistration(id as string, {
        presidentName,
        presidentPhone,
        maleDelegates: Number(maleDelegates),
        femaleDelegates: Number(femaleDelegates),
      });

    res.status(200).json({
      success: true,
      message: "Manual parish registration updated successfully.",
      data: updatedRegistration,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update manual parish registration.",
    });
  }
};


export const deleteManualRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await manualParishService.deleteManualRegistration(id as string);

    res.status(200).json({
      success: true,
      message: "Manual parish registration deleted successfully.",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete manual parish registration.",
    });
  }
};

export const allocateManualParishAccommodation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await manualParishService.allocateManualParishAccommodation(
        req.params.id as string,
        req.user!.userId
      );

    res.status(200).json({
      success: true,
      message: "Accommodation allocated successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
