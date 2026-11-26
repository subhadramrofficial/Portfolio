
export class EmailNotConfiguredError extends Error {
  constructor() {
    super("Resend is not configured");
    this.name = "EmailNotConfiguredError";
    this.code = "EMAIL_NOT_CONFIGURED";
  }
}

/** Removes line breaks to prevent email header injection. */
export function sanitizeHeaderValue(value) {
  return String(value).replace(/[\r\n]+/g, " ").trim().slice(0, 150);
}

export function buildNotification(
  { name, email, message, id, receivedAt },
  { from, to }
) {
  const when = (
    receivedAt instanceof Date ? receivedAt : new Date()
  ).toISOString();

  return {
    from,
    to,
    replyTo: email,
    subject: `New portfolio message from ${sanitizeHeaderValue(name)}`,
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

export function createEmailService({ apiKey, from, to }) {
  const configured = Boolean(apiKey && from && to);

  return {
    isConfigured: () => configured,

    async sendContactNotification(payload) {
      if (!configured) throw new EmailNotConfiguredError();

      const mail = buildNotification(payload, { from, to });

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: mail.from,
          to: [mail.to],
          reply_to: mail.replyTo,
          subject: mail.subject,
          text: mail.text,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const error = new Error(
          result?.message || "Failed to send email through Resend"
        );
        error.code = result?.name || "RESEND_ERROR";
        throw error;
      }

      return { messageId: result?.id };
    },

    async verify() {
      if (!configured) {
        return { ok: false, reason: "not_configured" };
      }

      return { ok: true };
    },
  };
}
