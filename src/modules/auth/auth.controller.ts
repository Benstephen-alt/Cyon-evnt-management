import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import {
  loginSchema,
  committeeLoginSchema,
} from "./auth.validation";

export class AuthController {
  static async adminLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validatedData = loginSchema.parse(req.body);

      const result = await AuthService.adminLogin(
        validatedData
      );

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async committeeLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validatedData =
        committeeLoginSchema.parse(req.body);

      const result =
        await AuthService.committeeLogin(
          validatedData
        );

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async parishLogin(
    req: Request,
    res: Response
  ) {
    try {
      const { accessCode } = req.body;

      const result =
        await AuthService.parishLogin(accessCode);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
}