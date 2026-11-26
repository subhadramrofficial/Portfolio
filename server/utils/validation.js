// Dependency-free validation + sanitization for the contact form.
// NOTE: client/src/lib/validation.js mirrors these rules for instant feedback.
// The server is the source of truth - never trust the client copy.

export const LIMITS = Object.freeze({
  name: { min: 2, max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 2000 },
  maxLinks: 3,
});

// Control chars (except \n, \t, \r), zero-width chars and BOM.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200D\u2060\uFEFF]/g;

const EMAIL_RE =
  /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const LINK_RE = /https?:\/\/|www\./gi;

export function sanitizeName(value) {
  return value.normalize("NFC").replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim();
}

export function sanitizeEmail(value) {
  return value.normalize("NFC").replace(CONTROL_CHARS, "").trim().toLowerCase();
}

export function sanitizeMessage(value) {
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_CHARS, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isValidEmail(email) {
  return email.length <= LIMITS.email.max && EMAIL_RE.test(email);
}

export function countLinks(text) {
  return (text.match(LINK_RE) || []).length;
}

/**
 * Validates and sanitizes a contact payload.
 * Returns { valid, errors, values }. `values` is only set when valid.
 * Non-string values (e.g. objects like { "$ne": "" }) are rejected outright.
 */
export function validateContact(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, errors: { form: "Request body must be a JSON object." }, values: null };
  }

  const errors = {};
  const labels = { name: "Name", email: "Email", message: "Message" };

  for (const field of ["name", "email", "message"]) {
    if (input[field] === undefined || input[field] === null) {
      errors[field] = `${labels[field]} is required.`;
    } else if (typeof input[field] !== "string") {
      errors[field] = `${labels[field]} must be text.`;
    }
  }
  if (Object.keys(errors).length) return { valid: false, errors, values: null };

  const name = sanitizeName(input.name);
  const email = sanitizeEmail(input.email);
  const message = sanitizeMessage(input.message);

  if (!name) errors.name = "Name is required.";
  else if (name.length < LIMITS.name.min) errors.name = `Name must be at least ${LIMITS.name.min} characters.`;
  else if (name.length > LIMITS.name.max) errors.name = `Name must be at most ${LIMITS.name.max} characters.`;

  if (!email) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Please enter a valid email address.";

  if (!message) errors.message = "Message is required.";
  else if (message.length < LIMITS.message.min)
    errors.message = `Message must be at least ${LIMITS.message.min} characters.`;
  else if (message.length > LIMITS.message.max)
    errors.message = `Message must be at most ${LIMITS.message.max} characters.`;
  else if (countLinks(message) > LIMITS.maxLinks)
    errors.message = `Messages with more than ${LIMITS.maxLinks} links can't be sent through this form.`;

  if (Object.keys(errors).length) return { valid: false, errors, values: null };
  return { valid: true, errors: {}, values: { name, email, message } };
}
