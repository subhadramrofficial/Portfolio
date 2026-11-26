import { API_URL } from "../lib/env.js";

const TIMEOUT_MS = 15_000;

/**
 * Sends the contact form to the Express API and normalizes every outcome into:
 *   { kind: "success" | "partial" | "validation" | "rate_limited" | "error", message, fields? }
 * "partial" = saved, but the notification email failed (reported honestly to the visitor).
 */
export async function submitContact(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      /* non-JSON response */
    }

    if (res.status === 201 && data?.ok === true && data.saved === true) {
      return data.notified === true
        ? { kind: "success", message: data.message || "Thanks! Your message has been sent." }
        : {
            kind: "partial",
            message:
              data.message ||
              "Your message was received, but the notification email could not be sent, so it may take a little longer to be seen.",
          };
    }

    if (res.status === 400 && data?.error?.fields) {
      return { kind: "validation", message: data.error.message || "Please correct the highlighted fields.", fields: data.error.fields };
    }
    if (res.status === 429) {
      return { kind: "rate_limited", message: "You've sent several messages recently. Please wait a while before trying again." };
    }
    return {
      kind: "error",
      message: data?.error?.message || "Something went wrong and your message was NOT sent. Please try again later.",
    };
  } catch (err) {
    if (err?.name === "AbortError") {
      return { kind: "error", message: "The request timed out, so your message may not have been sent. Please try again." };
    }
    return { kind: "error", message: "Couldn't reach the server, so your message was NOT sent. Check your connection and try again." };
  } finally {
    clearTimeout(timer);
  }
}
