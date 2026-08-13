import { NextFunction, Request, Response } from "express";
import * as committeeBadgeService from "./committee-badge.service";

function photoUrlFromRequest(req: Request): string | undefined {
  return req.file
    ? `/uploads/committee-members/${req.file.filename}`
    : undefined;
}

export async function getBadgeOptions(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await committeeBadgeService.getBadgeOptions();
    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createCommitteeBadge(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const photoUrl = photoUrlFromRequest(req);

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        message: "Committee member photo is required.",
      });
    }

    const data = await committeeBadgeService.createCommitteeBadge({
      committeeMemberId: String(req.body.committeeMemberId ?? ""),
      committeeId: String(req.body.committeeId ?? ""),
      fullName: String(req.body.fullName ?? ""),
      photoUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Committee badge created successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function listCommitteeBadges(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data =
      await committeeBadgeService.listCommitteeBadges();
    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getCommitteeBadge(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await committeeBadgeService.getCommitteeBadge(
      req.params.badgeId as string
    );
    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateCommitteeBadge(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await committeeBadgeService.updateCommitteeBadge(
      req.params.badgeId as string,
      {
        committeeId: req.body.committeeId || undefined,
        fullName: req.body.fullName || undefined,
        photoUrl: photoUrlFromRequest(req),
      }
    );

    return res.json({
      success: true,
      message: "Committee badge updated successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCommitteeBadge(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await committeeBadgeService.deleteCommitteeBadge(
      req.params.badgeId as string
    );
    return res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getCommitteeBadgeImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const image =
      await committeeBadgeService.generateCommitteeBadgeImage(
        req.params.badgeId as string
      );

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    return res.send(image);
  } catch (error) {
    next(error);
  }
}

export async function downloadCommitteeBadge(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const badge = await committeeBadgeService.getCommitteeBadge(
      req.params.badgeId as string
    );
    const image =
      await committeeBadgeService.generateCommitteeBadgeImage(
        badge.id
      );

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${badge.badgeNumber}.png"`
    );
    return res.send(image);
  } catch (error) {
    next(error);
  }
}

export async function downloadAllCommitteeBadges(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await committeeBadgeService.downloadAllCommitteeBadges();
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    result.stream.on("error", next);
    return result.stream.pipe(res);
  } catch (error) {
    next(error);
  }
}
