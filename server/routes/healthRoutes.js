import { Router } from "express";

export function createHealthRouter({ isDbReady, emailService }) {
  const router = Router();
  router.get("/", (req, res) => {
    const database = isDbReady() ? "connected" : "disconnected";
    const status = database === "connected" ? "ok" : "degraded";
    res.status(status === "ok" ? 200 : 503).json({
      ok: status === "ok",
      status,
      uptimeSeconds: Math.round(process.uptime()),
      database,
      emailConfigured: emailService.isConfigured(),
    });
  });
  return router;
}
