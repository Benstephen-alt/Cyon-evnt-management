import { NextFunction, Request, Response } from "express";
import { notificationRequestSchema, previewNotificationSchema } from "./notification.validation";
import * as notificationService from "./notification.service";

export async function preview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = previewNotificationSchema.parse(req.body);
    const result = await notificationService.previewRecipients(data);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function send(req: Request, res: Response, next: NextFunction) {
  try {
    const data = notificationRequestSchema.parse(req.body);
    const result = await notificationService.sendNotification(data, req.user!.userId);
    res.status(201).json({ success: true, message: "SMS campaign processed.", data: result });
  } catch (error) { next(error); }
}

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationService.getNotificationHistory();
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationService.getNotificationById(req.params.id as string);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}
