import { Request, Response } from "express";
import * as service from "./super-admin.service";
import { downloadDeaneryBadges } from "@/badge/badge.service";

export async function list(_req: Request, res: Response) {
  try { return res.json({ success: true, data: await service.getManagedParishes() }); }
  catch (error: any) { return res.status(400).json({ success: false, message: error.message }); }
}
export async function move(req: Request, res: Response) {
  try {
    await service.moveParish(req.params.accountId as string);
    return res.json({ success: true, message: "Parish moved to super admin successfully." });
  } catch (error: any) { return res.status(400).json({ success: false, message: error.message }); }
}
export async function restore(req: Request, res: Response) {
  try {
    await service.restoreParish(req.params.accountId as string);
    return res.json({ success: true, message: "Parish restored to the admin dashboard." });
  } catch (error: any) { return res.status(400).json({ success: false, message: error.message }); }
}

export async function deaneries(_req: Request, res: Response) {
  try { return res.json({ success: true, data: await service.getDeaneries() }); }
  catch (error: any) { return res.status(400).json({ success: false, message: error.message }); }
}

export async function downloadDeaneryBadgeZip(req: Request, res: Response) {
  try {
    const result = await downloadDeaneryBadges(req.params.deaneryId as string);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    result.stream.on("error", () => {
      if (!res.headersSent) res.status(500).json({ success: false, message: "Badge ZIP generation failed." });
      else res.destroy();
    });
    result.stream.pipe(res);
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}
