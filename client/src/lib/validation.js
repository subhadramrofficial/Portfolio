// Mirrors server/utils/validation.js so visitors get instant feedback.
// The server re-validates everything - this copy is for UX only. Keep the limits in sync.

export const LIMITS = Object.freeze({
  name: { min: 2, max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 2000 },
  maxLinks: 3,
});

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200D\u2060\uFEFF]/g;
const EMAIL_RE =
  /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const LINK_RE = /https?:\/\/|www\./gi;

const cleanName = (v) => v.normalize("NFC").replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim();
const cleanEmail = (v) => v.normalize("NFC").replace(CONTROL_CHARS, "").trim().toLowerCase();
const cleanMessage = (v) =>
  v.normalize("NFC").replace(/\r\n?/g, "\n").replace(CONTROL_CHARS, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

export function validateContact({ name = "", email = "", message = "" }) {
  const values = { name: cleanName(String(name)), email: cleanEmail(String(email)), message: cleanMessage(String(message)) };
  const errors = {};

  if (!values.name) errors.name = "Please enter your name.";
  else if (values.name.length < LIMITS.name.min) errors.name = `Name must be at least ${LIMITS.name.min} characters.`;
  else if (values.name.length > LIMITS.name.max) errors.name = `Name must be at most ${LIMITS.name.max} characters.`;

  if (!values.email) errors.email = "Please enter your email address.";
  else if (values.email.length > LIMITS.email.max || !EMAIL_RE.test(values.email)) errors.email = "Please enter a valid email address.";

  if (!values.message) errors.message = "Please write a message.";
  else if (values.message.length < LIMITS.message.min) errors.message = `Message must be at least ${LIMITS.message.min} characters.`;
  else if (values.message.length > LIMITS.message.max) errors.message = `Message must be at most ${LIMITS.message.max} characters.`;
  else if ((values.message.match(LINK_RE) || []).length > LIMITS.maxLinks)
    errors.message = `Messages with more than ${LIMITS.maxLinks} links can't be sent through this form.`;

  return { valid: Object.keys(errors).length === 0, errors, values };
}
