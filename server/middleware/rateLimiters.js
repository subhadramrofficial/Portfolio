import rateLimit from "express-rate-limit";
import { sendError } from "../utils/response.js";

const handler = (req, res) =>
  sendError(res, 429, "RATE_LIMITED", "Too many requests. Please wait a while and try again.");

// Broad limiter for every /api route.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Strict limiter for the contact form: 5 submissions per IP per hour.
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
