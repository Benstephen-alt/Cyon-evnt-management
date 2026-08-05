import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      role: string;
      portal: "ADMIN" | "COMMITTEE" | "PARISH";
    };
  }
}


export {};
