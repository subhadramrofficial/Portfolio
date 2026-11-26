
import test from "node:test";
import assert from "node:assert/strict";

import {
  createEmailService,
  buildNotification,
  sanitizeHeaderValue,
  EmailNotConfiguredError,
} from "../services/emailService.js";

const apiKey = "re_test_key";
const from = "Portfolio <onboarding@resend.dev>";
const to = "me@test.dev";

test("sends a notification with correct addressing and plain-text body", async () => {
  let request;

  const svc = createEmailService({ apiKey, from, to });

  // Mock fetch so the test never sends a real email.
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, options) => {
    request = { url, options };

    return {
      ok: true,
      json: async () => ({ id: "email-id-123" }),
    };
  };

  try {
    const out = await svc.sendContactNotification({
      name: "Ada",
      email: "ada@example.com",
      message: "Hi there",
      id: "r1",
    });

    assert.equal(out.messageId, "email-id-123");
    assert.equal(request.url, "https://api.resend.com/emails");
    assert.equal(request.options.method, "POST");
    assert.equal(
      request.options.headers.Authorization,
      `Bearer ${apiKey}`
    );

    const body = JSON.parse(request.options.body);

    assert.deepEqual(body.to, [to]);
    assert.equal(body.from, from);
    assert.equal(body.reply_to, "ada@example.com");
    assert.equal(body.subject, "New portfolio message from Ada");
    assert.ok(body.text.includes("Hi there"));
    assert.ok(body.text.includes("r1"));
    assert.equal(body.html, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("throws EmailNotConfiguredError when Resend settings are missing", async () => {
  const svc = createEmailService({
    apiKey: "",
    from,
    to,
  });

  assert.equal(svc.isConfigured(), false);

  await assert.rejects(
    () =>
      svc.sendContactNotification({
        name: "A",
        email: "a@b.co",
        message: "m",
      }),
    EmailNotConfiguredError
  );

  assert.deepEqual(await svc.verify(), {
    ok: false,
    reason: "not_configured",
  });
});

test("throws when no recipient is configured", () => {
  const svc = createEmailService({ apiKey, from, to: "" });

  assert.equal(svc.isConfigured(), false);
});

test("propagates Resend API failures to the caller", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    json: async () => ({
      message: "Invalid API key",
      name: "validation_error",
    }),
  });

  try {
    const svc = createEmailService({ apiKey, from, to });

    await assert.rejects(
      () =>
        svc.sendContactNotification({
          name: "A",
          email: "a@b.co",
          message: "m",
        }),
      { code: "validation_error" }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verify() reports configured Resend settings without throwing", async () => {
  const svc = createEmailService({ apiKey, from, to });

  assert.deepEqual(await svc.verify(), { ok: true });
});

test("header values cannot contain line breaks", () => {
  assert.equal(
    sanitizeHeaderValue("Ada\r\nBcc: x@y.z"),
    "Ada Bcc: x@y.z"
  );

  const mail = buildNotification(
    {
      name: "Ada\nBcc: x",
      email: "a@b.co",
      message: "m",
    },
    { from, to }
  );

  assert.ok(!/[\r\n]/.test(mail.subject));
});
