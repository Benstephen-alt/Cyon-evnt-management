import { NextFunction, Request, Response } from "express";
import prisma from "@/config/prisma";

export async function authorizeAdminPortal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.portal !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "This token cannot access the admin portal.",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: { admin: true },
  });

  if (!user || !user.admin || !user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Admin portal access denied.",
    });
  }

  const allowed =
    user.role === "SUPER_ADMIN" ||
    (user.role === "ADMIN" && user.admin.adminPortalAccess);

  if (!allowed) {
    return res.status(403).json({
      success: false,
      code: "ADMIN_PORTAL_RESTRICTED",
      message: "This account is restricted to the committee portal.",
    });
  }

  next();
}
