import { NextFunction, Request, Response } from "express";
import { CommitteePermission } from "@prisma/client";
import { hasPermission } from "@/shared/services/permission.service";

export function authorizePermission(
  ...permissions: CommitteePermission[]
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      for (const permission of permissions) {
        const allowed = await hasPermission(
          req.user.userId,
          permission
        );

        if (allowed) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
}