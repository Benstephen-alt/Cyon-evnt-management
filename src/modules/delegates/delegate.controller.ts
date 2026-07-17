import { Request, Response } from "express";
import * as delegateService from "./delegate.services";
import { getDelegateDetails, } from "./delegate.services";

export async function createDelegate(
  req: Request,
  res: Response
) {
  try {
    console.log("BODY:", req.body);
     console.log("FILE:", req.file);

    const data = {
      ...req.body,
      photoUrl: req.file?.path, // or req.file?.filename depending on your storage
    };

    const result = await delegateService.createDelegate(
      data,
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

export async function getDelegates(
  req: Request,
  res: Response
) {
  try {
    const result = await delegateService.getDelegates(
      req.user!.userId
    );

    return res.json(result);

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export async function getDelegateById(
  req: Request,
  res: Response
) {
  try {
    const result = await delegateService.getDelegateById(
      req.params.id as string,
      req.user!.userId
    );

    return res.json(result);

  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}


export async function updateDelegate(
  req: Request,
  res: Response
) {
  try {
    const result = await delegateService.updateDelegate(
      req.params.id as string,
      req.body,
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


export async function deleteDelegate(
  req: Request,
  res: Response
) {
  try {
    const result = await delegateService.deleteDelegate(
      req.params.id as string,
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

export async function getDelegateDetailsController(
  req: Request,
  res: Response
) {
  try {
    const delegate = await getDelegateDetails(req.params.id as string);

    return res.status(200).json(delegate);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

// delegate.controller.ts

export async function uploadDelegatePhotoController(
  req: Request,
  res: Response
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No photo uploaded.",
      });
    }

    return res.json({
      success: true,
      photoUrl: `/uploads/delegates/${req.file.filename}`,
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getDelegate(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user!.userId;

    const { delegateId } = req.params;

    const result = await delegateService.getDelegate(
      delegateId as string,
      userId
    );

    return res.json({
      success: true,
      delegate: result,
    });

  } catch (error: any) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
}

export async function getParishDelegates(
  req: Request,
  res: Response
) {
  try {
    const result =
      await delegateService.getParishDelegates(
        req.user!.userId,
        req.query.search as string | undefined
      );

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}