import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
import apiRoutes from "./routes";
import { draftRoutes } from "./modules/delegate-drafts";
import { ZodError } from "zod";
import { AppError } from "./shared/errors/AppError";


dotenv.config();

const app: Application = express();



app.use("/delegate-drafts", draftRoutes);

/**
 * ===========================================
 * Security Middleware
 * ===========================================
 */
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

/**
 * ===========================================
 * CORS
 * ===========================================
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/**
 * ===========================================
 * Compression
 * ===========================================
 */
app.use(compression());

/**
 * ===========================================
 * Logger
 * ===========================================
 */
app.use(morgan("dev"));

/**
 * ===========================================
 * Body Parser
 * ===========================================
 */
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * ===========================================
 * File Upload
 * ===========================================
 */
/**app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: Number(process.env.MAX_FILE_SIZE)
    },
    abortOnLimit: true
  })
);

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);


/**
 * ===========================================
 * Static Uploads
 * ===========================================
 */



app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);

/**
 * ===========================================
 * Health Check
 * ===========================================
 */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    application: process.env.APP_NAME,
    version: "1.0.0",
    message: "CYON Event Management System API is running.",
    timestamp: new Date()
  });
});

/**
 * ===========================================
 * API Routes
 * ===========================================
 */
app.use("/api", apiRoutes);

/**
 * ===========================================
 * 404 Handler
 * ===========================================
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found."
  });
});

/**
 * ===========================================
 * Global Error Handler
 * ===========================================
 */
app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message:
          error.issues[0]?.message ??
          "Invalid request data.",
      });
    }

    if (error instanceof AppError) {
      return res
        .status(error.statusCode)
        .json({
          success: false,
          code: error.code,
          message: error.message,
        });
    }

    console.error("Unexpected server error:", error);

    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Server error. Please try again later.",
    });
  }
);

export default app;