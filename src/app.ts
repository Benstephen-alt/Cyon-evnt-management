import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
import apiRoutes from "./routes";
import { draftRoutes}  from "@/modules/delegate-drafts/index";


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
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
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
  express.static(path.join(process.cwd(), "uploads"))
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
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : undefined
    });
  }
);

export default app;