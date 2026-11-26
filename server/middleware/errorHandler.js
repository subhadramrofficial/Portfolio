import { sendError } from "../utils/response.js";
import { safeErrorInfo } from "../utils/safeLog.js";

export function notFound(req, res) {
  return sendError(res, 404, "NOT_FOUND", "Route not found.");
}

// Centralized error handler. Never leaks stack traces or internals to clients.
// eslint-disable-next-line no-unused-vars
export function createErrorHandler(logger = console) {
  return function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    if (err?.type === "entity.parse.failed") {
      return sendError(res, 400, "INVALID_JSON", "Request body is not valid JSON.");
    }
    if (err?.type === "entity.too.large") {
      return sendError(res, 413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
    }
    if (err?.code === "CORS_NOT_ALLOWED") {
      return sendError(res, 403, "CORS_NOT_ALLOWED", "This origin is not allowed.");
    }

    logger.error("[error] Unhandled error", safeErrorInfo(err));
    return sendError(res, 500, "INTERNAL_ERROR", "Something went wrong. Please try again later.");
  };
}
