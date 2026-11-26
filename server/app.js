import express from "express";
import helmet from "helmet";
import cors from "cors";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { notFound, createErrorHandler } from "./middleware/errorHandler.js";

export function createApp({ env, contactRouter, healthRouter }) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.trustProxy); // required for correct per-IP rate limiting behind a proxy

  app.use(helmet());

  const allowedOrigins = new Set(env.clientOrigins);
  app.use(
    cors({
      origin(origin, callback) {
        // No Origin header = non-browser client (curl, health checks): CORS doesn't apply.
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        const err = new Error("Origin not allowed by CORS");
        err.code = "CORS_NOT_ALLOWED";
        return callback(err);
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
      maxAge: 600,
    })
  );

  app.use("/api", apiLimiter);
  app.use(express.json({ limit: "10kb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/contact", contactRouter);

  app.use(notFound);
  app.use(createErrorHandler());
  return app;
}
