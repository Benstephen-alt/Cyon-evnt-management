import { Request, Response } from "express";
import { generateBadge } from "./badge.service";
import * as badgeService from "./badge.service";
import prisma from "@/config/prisma";

export async function getBadge(
  req: Request,
  res: Response
) {
  try {
    const badge = await generateBadge(req.params.delegateId as string);

    res.setHeader("Content-Type", "image/png");

    return res.send(badge);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      success: false,
      message: "Badge generation failed.",
    });
  }
}

export async function verifyBadges(req: Request, res: Response) {
  try {
   const  token  = req.params.token as string;

const result = await badgeService.verifyBadge(token);

    return res.json(result);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function downloadBadge(req: Request, res: Response) {
  try {
    const { delegateId } = req.params;

    const delegate = await badgeService.getDelegateById(
      delegateId as string
    );

    const badge = await badgeService.generateBadge(
      delegateId as string
    );

    res.setHeader("Content-Type", "image/png");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${delegate.delegateNumber}.png"`
    );

    return res.send(badge);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function downloadMyParishBadges(
  req: Request,
  res: Response
) {
  try {
    const account = await prisma.parishAccount.findUnique({
  where: {
    userId: req.user!.userId,
  },
});

if (!account) {
  throw new Error("Parish account not found.");
}

const parishId = account.parishId;

    const result = await badgeService.downloadParishBadges(parishId);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.parishName}-badges.zip"`
    );

    result.stream.pipe(res);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function downloadAdminParishBadges(
  req: Request,
  res: Response
) {
  try {
    console.log("Download request received");

    const parishId = req.params.parishId as string;

    console.log("Parish:", parishId);

    const result =
      await badgeService.downloadAdminParishBadges(parishId);

    console.log("Badge service finished");

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.parishName}-badges.zip"`
    );

    result.stream.pipe(res);

    console.log("Response piped");

  } catch (error: any) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}