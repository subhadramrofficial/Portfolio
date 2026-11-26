import dotenv from "dotenv";

dotenv.config();

const toInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};
const toBool = (value, fallback = false) =>
  value === undefined || value === ""
    ? fallback
    : ["true", "1", "yes"].includes(String(value).toLowerCase());

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

let clientOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);
if (!isProduction && clientOrigins.length === 0)
  clientOrigins = ["http://localhost:5173"];

const smtp = {
  host: process.env.SMTP_HOST || "",
  port: toInt(process.env.SMTP_PORT, 587),
  secure: toBool(process.env.SMTP_SECURE, false),
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
};

export const env = Object.freeze({
  nodeEnv,
  isProduction,
  port: toInt(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI || "",
  clientOrigins,
  trustProxy: toInt(process.env.TRUST_PROXY, 0),
  smtp,
  notifyTo: process.env.CONTACT_RECIPIENT_EMAIL || "",
});

/** Returns { errors, warnings }. Errors stop the server from starting. */
export function validateEnv(config = env) {
  const errors = [];
  const warnings = [];
  if (!config.mongoUri) errors.push("MONGODB_URI is required.");
  if (config.isProduction && config.clientOrigins.length === 0) {
    errors.push(
      "CLIENT_ORIGIN is required in production (set it to your frontend's exact origin).",
    );
  }
  const resendConfigured = Boolean(
    process.env.RESEND_API_KEY && process.env.RESEND_FROM && config.notifyTo,
  );

  if (!resendConfigured) {
    warnings.push(
      "Resend is not fully configured (need RESEND_API_KEY, RESEND_FROM and CONTACT_RECIPIENT_EMAIL). " +
        "Messages will be saved, but notification emails will NOT be sent.",
    );
  }
  return { errors, warnings };
}
