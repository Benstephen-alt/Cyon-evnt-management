import { NextFunction, Request, Response } from "express";

type Portal = "ADMIN" | "COMMITTEE" | "PARISH";

export function authorizePortal(...portals: Portal[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!portals.includes(req.user.portal)) {
      return res.status(403).json({
        success: false,
        message: "This token cannot access this portal.",
      });
    }

    next();
  };
}
