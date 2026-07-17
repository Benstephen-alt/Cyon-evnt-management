import { Router } from "express";
import { AuthController, } from "./auth.controller";

const router = Router();

router.post(
  "/admin/login",
  AuthController.adminLogin
);

router.post("/parish/login", AuthController.parishLogin);

router.post(
  "/committee/login",
   AuthController.committeeLogin
);

export default router;