import { Request, Response } from "express";
import * as service from "./super-admin.service";

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
