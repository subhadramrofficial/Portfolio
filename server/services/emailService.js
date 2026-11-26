// Email notification service. nodemailer is injected (see config/mailer.js) so this
// module has no third-party imports and can be unit-tested with a fake transport.

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("SMTP is not configured");
    this.name = "EmailNotConfiguredError";
    this.code = "EMAIL_NOT_CONFIGURED";
  }
}

/** Removes line breaks so user input can never inject extra mail headers. */
export function sanitizeHeaderValue(value) {
  return String(value).replace(/[\r\n]+/g, " ").trim().slice(0, 150);
}

export function buildNotification({ name, email, message, id, receivedAt }, { from, to }) {
  const when = (receivedAt instanceof Date ? receivedAt : new Date()).toISOString();
  return {
    from,
    to,
    replyTo: email, // already validated: no whitespace/newlines
    subject: `New portfolio message from ${sanitizeHeaderValue(name)}`,
    // Plain text only - no HTML, so message content can't inject markup.
    text: [
      "You received a new message through your portfolio contact form.",
      "",
      `Name:     ${name}`,
      `Email:    ${email}`,
      `Received: ${when}`,
      id ? `Record:   ${id}` : null,
      "",
      "Message:",
      message,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  };
}

export function createEmailService({ createTransport, smtp, to }) {
  const configured = Boolean(smtp?.host && smtp?.user && smtp?.pass && smtp?.from && to);
  let transporter = null;

  const getTransporter = () => {
    if (!transporter) {
      transporter = createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: { user: smtp.user, pass: smtp.pass },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      });
    }
    return transporter;
  };

  return {
    isConfigured: () => configured,

    async sendContactNotification(payload) {
      if (!configured) throw new EmailNotConfiguredError();
      const mail = buildNotification(payload, { from: smtp.from, to });
      const info = await getTransporter().sendMail(mail);
      return { messageId: info?.messageId };
    },

    /** Checks SMTP connectivity/credentials. Never throws. */
    async verify() {
      if (!configured) return { ok: false, reason: "not_configured" };
      try {
        await getTransporter().verify();
        return { ok: true };
      } catch (err) {
        return { ok: false, reason: err?.code || "verify_failed" };
      }
    },
  };
}
