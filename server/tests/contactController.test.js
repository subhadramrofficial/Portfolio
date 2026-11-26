import test from "node:test";
import assert from "node:assert/strict";
import { createContactController } from "../controllers/contactController.js";
import { fakeRes, silentLogger, validBody } from "./helpers.js";

function setup({ createImpl, sendImpl, dbReady = true } = {}) {
  const calls = { create: [], update: [], send: [] };
  const ContactMessage = {
    create: async (v) => {
      calls.create.push(v);
      if (createImpl) return createImpl(v);
      return { _id: "abc123", createdAt: new Date("2026-01-01T00:00:00Z"), ...v };
    },
    updateOne: async (...args) => { calls.update.push(args); },
  };
  const emailService = {
    sendContactNotification: async (p) => {
      calls.send.push(p);
      if (sendImpl) return sendImpl(p);
      return { messageId: "m1" };
    },
  };
  const logger = silentLogger();
  const controller = createContactController({ ContactMessage, emailService, isDbReady: () => dbReady, logger });
  return { controller, calls, logger };
}

const run = async (controller, body) => {
  const res = fakeRes();
  let nextErr;
  await controller.submit({ body }, res, (e) => { nextErr = e; });
  return { res, nextErr };
};

test("saves, emails and reports success", async () => {
  const { controller, calls } = setup();
  const { res } = await run(controller, validBody());
  assert.equal(res.statusCode, 201);
  assert.deepEqual([res.body.ok, res.body.saved, res.body.notified], [true, true, true]);
  assert.deepEqual(calls.create[0], { name: "Ada Lovelace", email: "ada@example.com", message: "Hello, I would like to talk about a web developer role." });
  assert.equal(calls.send.length, 1);
  assert.equal(calls.send[0].id, "abc123");
  assert.deepEqual(calls.update[0][1], { notificationStatus: "sent" });
});

test("save failure: 500, NO success, and no email is attempted", async () => {
  const { controller, calls, logger } = setup({ createImpl: () => { throw new Error("db write failed"); } });
  const { res } = await run(controller, validBody());
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.ok, false);
  assert.equal(res.body.error.code, "SAVE_FAILED");
  assert.equal(calls.send.length, 0);
  assert.equal(logger.calls.error.length, 1);
});

test("email failure: saved but honestly reported as not notified", async () => {
  const err = Object.assign(new Error("Invalid login"), { code: "EAUTH" });
  const { controller, calls } = setup({ sendImpl: () => { throw err; } });
  const { res } = await run(controller, validBody());
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.saved, true);
  assert.equal(res.body.notified, false);
  assert.match(res.body.message, /could not be sent/);
  assert.deepEqual(calls.update[0][1], { notificationStatus: "failed", notificationError: "EAUTH" });
});

test("email not configured is treated as a notification failure", async () => {
  const { EmailNotConfiguredError } = await import("../services/emailService.js");
  const { controller } = setup({ sendImpl: () => { throw new EmailNotConfiguredError(); } });
  const { res } = await run(controller, validBody());
  assert.equal(res.body.saved, true);
  assert.equal(res.body.notified, false);
});

test("logs email failures without leaking the message body", async () => {
  const { controller, logger } = setup({ sendImpl: () => { throw Object.assign(new Error("boom"), { code: "ESOCKET" }); } });
  await run(controller, validBody());
  const logged = JSON.stringify(logger.calls.error);
  assert.ok(logged.includes("ESOCKET"));
  assert.ok(!logged.includes("web developer role"));
});

test("a failure while recording notification status does not change the response", async () => {
  const calls = [];
  const ContactMessage = {
    create: async (v) => ({ _id: "1", ...v }),
    updateOne: async () => { throw new Error("update failed"); },
  };
  const emailService = { sendContactNotification: async () => ({}) };
  const controller = createContactController({ ContactMessage, emailService, isDbReady: () => true, logger: silentLogger() });
  const { res } = await run(controller, validBody());
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.notified, true);
  void calls;
});

test("validation failure: 400 with field errors, nothing saved or sent", async () => {
  const { controller, calls } = setup();
  const { res } = await run(controller, { name: "A", email: "nope", message: "x" });
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.code, "VALIDATION_ERROR");
  assert.ok(res.body.error.fields.name && res.body.error.fields.email && res.body.error.fields.message);
  assert.equal(calls.create.length, 0);
  assert.equal(calls.send.length, 0);
});

test("honeypot submissions are rejected and not saved", async () => {
  const { controller, calls } = setup();
  const { res } = await run(controller, { ...validBody(), botTrap: "http://spam.example" });
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.code, "SUBMISSION_REJECTED");
  assert.equal(calls.create.length, 0);
});

test("database unavailable: 503, nothing saved, no success", async () => {
  const { controller, calls } = setup({ dbReady: false });
  const { res } = await run(controller, validBody());
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.ok, false);
  assert.equal(calls.create.length, 0);
});

test("unexpected errors are forwarded to the central error handler", async () => {
  const controller = createContactController({
    ContactMessage: {},
    emailService: {},
    isDbReady: () => { throw new Error("unexpected"); },
    logger: silentLogger(),
  });
  const { nextErr, res } = await run(controller, validBody());
  assert.ok(nextErr instanceof Error);
  assert.equal(res.body, undefined);
});
