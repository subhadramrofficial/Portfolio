import { validateContact } from "../utils/validation.js";
import { sendOk, sendError } from "../utils/response.js";
import { safeErrorInfo } from "../utils/safeLog.js";

/**
 * Dependencies are injected so the controller can be tested without a database
 * or SMTP server (see tests/contactController.test.js).
 */
export function createContactController({ ContactMessage, emailService, isDbReady, logger = console }) {
  async function submit(req, res, next) {
    try {
      const body = req.body;

      // Honeypot: real visitors never see or fill this hidden field.
      if (body && typeof body === "object" && body.botTrap) {
        return sendError(res, 400, "SUBMISSION_REJECTED", "Your submission could not be processed.");
      }

      const { valid, errors, values } = validateContact(body);
      if (!valid) {
        return sendError(res, 400, "VALIDATION_ERROR", "Please correct the highlighted fields.", errors);
      }

      if (!isDbReady()) {
        logger.error("[contact] Rejected submission: database not connected");
        return sendError(res, 503, "SERVICE_UNAVAILABLE", "The service is temporarily unavailable. Please try again later.");
      }

      // 1) Save. If this fails the visitor is NEVER told it worked.
      let doc;
      try {
        doc = await ContactMessage.create(values);
      } catch (err) {
        logger.error("[contact] Failed to save message", safeErrorInfo(err));
        return sendError(res, 500, "SAVE_FAILED", "Your message could not be saved. Please try again later.");
      }

      // 2) Notify. Failure here is reported honestly: saved, but not notified.
      let notified = false;
      let failureCode = null;
      try {
        await emailService.sendContactNotification({
          ...values,
          id: String(doc._id),
          receivedAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(),
        });
        notified = true;
      } catch (err) {
        failureCode = String(err?.code || err?.name || "EMAIL_FAILED").slice(0, 100);
        logger.error("[contact] Notification email failed", { id: String(doc._id), ...safeErrorInfo(err) });
      }

      // Record the notification outcome; a failure here must not affect the response.
      try {
        await ContactMessage.updateOne(
          { _id: doc._id },
          notified
            ? { notificationStatus: "sent" }
            : { notificationStatus: "failed", notificationError: failureCode }
        );
      } catch (err) {
        logger.error("[contact] Failed to record notification status", safeErrorInfo(err));
      }

      if (notified) {
        return sendOk(res, 201, { saved: true, notified: true, message: "Thanks! Your message has been sent." });
      }
      return sendOk(res, 201, {
        saved: true,
        notified: false,
        message:
          "Your message was received and saved, but the notification email could not be sent, so it may take a little longer for it to be seen.",
      });
    } catch (err) {
      return next(err);
    }
  }

  return { submit };
}
