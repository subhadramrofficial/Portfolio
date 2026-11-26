
import { env } from "./env.js";
import { createEmailService } from "../services/emailService.js";

export const emailService = createEmailService({
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.RESEND_FROM,
  to: env.notifyTo,
});
