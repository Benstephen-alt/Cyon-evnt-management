import { Request, Response } from "express";
import * as draftService from "./draft.service";

export async function createDraft(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.userId;

    const result = await draftService.createDraft(
      req.body,
      userId
    );

    return res.status(201).json({
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

export async function getDrafts(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.userId;

    const result = await draftService.getDrafts(userId);

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

export async function updateCurrentDraft(
  req: Request,
  res: Response
) {
console.log("HEADERS:", req.headers.authorization);
  console.log("USER:", req.user);


  try {
    const userId = req.user!.userId;

    const result =
      await draftService.updateDraft(
        req.body,
        userId
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

export async function deleteCurrentDraft(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.userId;

    const result =
      await draftService.deleteDraft(
        userId
      );

    return res.json(result);

  } catch (error: any) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
}

export async function submitCurrentDraftController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.userId;

    const result =
      await draftService.submitDraft(
        userId
      );

    return res.status(201).json(result);

  } catch (error: any) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
}