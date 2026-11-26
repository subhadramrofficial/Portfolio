import nodemailer from "nodemailer";
import { env } from "./env.js";
import { createEmailService } from "../services/emailService.js";

export const emailService = createEmailService({
  createTransport: nodemailer.createTransport.bind(nodemailer),
  smtp: env.smtp,
  to: env.notifyTo,
});
