import { env, validateEnv } from "./config/env.js";
import { connectDB, disconnectDB, isDbReady } from "./config/db.js";
import { emailService } from "./config/mailer.js";
import ContactMessage from "./models/ContactMessage.js";
import { createContactController } from "./controllers/contactController.js";
import { createContactRouter } from "./routes/contactRoutes.js";
import { createHealthRouter } from "./routes/healthRoutes.js";
import { contactLimiter } from "./middleware/rateLimiters.js";
import { createApp } from "./app.js";

const { errors, warnings } = validateEnv();
warnings.forEach((w) => console.warn(`[config] ${w}`));
if (errors.length) {
  errors.forEach((e) => console.error(`[config] ${e}`));
  console.error("[config] Fix the above in server/.env (see .env.example) and restart.");
  process.exit(1);
}

try {
  await connectDB(env.mongoUri);
} catch (err) {
  // Log only the error name/code - connection strings contain credentials.
  console.error(`[db] Could not connect to MongoDB (${err.name}${err.code ? `: ${err.code}` : ""}).`);
  console.error("[db] Check MONGODB_URI, your database user, and Atlas Network Access (IP allow-list).");
  process.exit(1);
}

// Informational only: tells you at startup whether SMTP credentials work.
emailService.verify().then((result) => {
  if (result.ok) console.log("[mail] Resend email service configured");
  else if (result.reason !== "not_configured") console.warn(`[mail] SMTP verification failed (${result.reason}). Notifications will fail until fixed.`);
});

const controller = createContactController({ ContactMessage, emailService, isDbReady });
const app = createApp({
  env,
  contactRouter: createContactRouter({ controller, limiter: contactLimiter }),
  healthRouter: createHealthRouter({ isDbReady, emailService }),
});

const server = app.listen(env.port, () => {
  console.log(`[server] Listening on port ${env.port} (${env.nodeEnv})`);
  console.log(`[server] Allowed CORS origin(s): ${env.clientOrigins.join(", ")}`);
});

async function shutdown(signal) {
  console.log(`[server] ${signal} received, shutting down...`);
  server.close(async () => {
    await disconnectDB().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
