import test from "node:test";
import assert from "node:assert/strict";
import { createEmailService, buildNotification, sanitizeHeaderValue, EmailNotConfiguredError } from "../services/emailService.js";

const smtp = { host: "smtp.test", port: 587, secure: false, user: "u", pass: "p", from: "Portfolio <from@test.dev>" };

test("sends a notification with correct addressing and plain-text body", async () => {
  const sent = [];
  let transportOpts;
  const svc = createEmailService({
    createTransport: (opts) => { transportOpts = opts; return { sendMail: async (m) => { sent.push(m); return { messageId: "id1" }; } }; },
    smtp,
    to: "me@test.dev",
  });
  const out = await svc.sendContactNotification({ name: "Ada", email: "ada@example.com", message: "Hi there", id: "r1" });
  assert.equal(out.messageId, "id1");
  assert.equal(sent[0].to, "me@test.dev");
  assert.equal(sent[0].from, smtp.from);
  assert.equal(sent[0].replyTo, "ada@example.com");
  assert.equal(sent[0].subject, "New portfolio message from Ada");
  assert.ok(sent[0].text.includes("Hi there") && sent[0].text.includes("r1"));
  assert.equal(sent[0].html, undefined);
  assert.deepEqual(transportOpts.auth, { user: "u", pass: "p" });
  assert.ok(transportOpts.connectionTimeout > 0 && transportOpts.socketTimeout > 0);
});

test("throws EmailNotConfiguredError when SMTP settings are missing", async () => {
  const svc = createEmailService({ createTransport: () => { throw new Error("must not be called"); }, smtp: { ...smtp, pass: "" }, to: "me@test.dev" });
  assert.equal(svc.isConfigured(), false);
  await assert.rejects(() => svc.sendContactNotification({ name: "A", email: "a@b.co", message: "m" }), EmailNotConfiguredError);
  assert.deepEqual(await svc.verify(), { ok: false, reason: "not_configured" });
});

test("throws when no recipient is configured", async () => {
  const svc = createEmailService({ createTransport: () => ({}), smtp, to: "" });
  assert.equal(svc.isConfigured(), false);
});

test("propagates transport failures to the caller (never swallows them)", async () => {
  const svc = createEmailService({
    createTransport: () => ({ sendMail: async () => { throw Object.assign(new Error("nope"), { code: "ECONNECTION" }); } }),
    smtp,
    to: "me@test.dev",
  });
  await assert.rejects(() => svc.sendContactNotification({ name: "A", email: "a@b.co", message: "m" }), { code: "ECONNECTION" });
});

test("verify() reports failures without throwing", async () => {
  const svc = createEmailService({ createTransport: () => ({ verify: async () => { throw Object.assign(new Error("x"), { code: "EAUTH" }); } }), smtp, to: "me@test.dev" });
  assert.deepEqual(await svc.verify(), { ok: false, reason: "EAUTH" });
});

test("header values cannot contain line breaks", () => {
  assert.equal(sanitizeHeaderValue("Ada\r\nBcc: x@y.z"), "Ada Bcc: x@y.z");
  const mail = buildNotification({ name: "Ada\nBcc: x", email: "a@b.co", message: "m" }, { from: "f", to: "t" });
  assert.ok(!/[\r\n]/.test(mail.subject));
});
