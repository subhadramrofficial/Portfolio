import test from "node:test";
import assert from "node:assert/strict";
import { submitContact } from "../src/api/contact.js";

const payload = { name: "Ada", email: "a@b.co", message: "Hello there, nice portfolio." };
const jsonResponse = (status, body) => ({ status, ok: status < 400, json: async () => body });

function mockFetch(impl) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return impl(url, init);
  };
  return calls;
}

test("201 saved + notified -> success, posts JSON to /api/contact", async () => {
  const calls = mockFetch(() => jsonResponse(201, { ok: true, saved: true, notified: true, message: "Thanks!" }));
  const r = await submitContact(payload);
  assert.deepEqual(r, { kind: "success", message: "Thanks!" });
  assert.equal(calls[0].url, "/api/contact");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(calls[0].init.body), payload);
});

test("201 saved but not notified -> partial (never plain success)", async () => {
  mockFetch(() => jsonResponse(201, { ok: true, saved: true, notified: false, message: "Received, but email failed." }));
  const r = await submitContact(payload);
  assert.equal(r.kind, "partial");
});

test("a 2xx body that doesn't confirm the save is NOT treated as success", async () => {
  mockFetch(() => jsonResponse(200, { ok: true }));
  assert.equal((await submitContact(payload)).kind, "error");
  mockFetch(() => jsonResponse(201, { ok: true, saved: false, notified: true }));
  assert.equal((await submitContact(payload)).kind, "error");
});

test("400 with fields -> validation", async () => {
  mockFetch(() => jsonResponse(400, { ok: false, error: { code: "VALIDATION_ERROR", message: "Fix fields", fields: { email: "bad" } } }));
  const r = await submitContact(payload);
  assert.equal(r.kind, "validation");
  assert.deepEqual(r.fields, { email: "bad" });
});

test("429 -> rate_limited", async () => {
  mockFetch(() => jsonResponse(429, { ok: false, error: { code: "RATE_LIMITED", message: "slow down" } }));
  assert.equal((await submitContact(payload)).kind, "rate_limited");
});

test("500 / 503 -> error using the server's message", async () => {
  mockFetch(() => jsonResponse(500, { ok: false, error: { code: "SAVE_FAILED", message: "Could not save." } }));
  const r = await submitContact(payload);
  assert.equal(r.kind, "error");
  assert.equal(r.message, "Could not save.");
});

test("non-JSON error responses still produce an honest error", async () => {
  mockFetch(() => ({ status: 502, ok: false, json: async () => { throw new SyntaxError("not json"); } }));
  const r = await submitContact(payload);
  assert.equal(r.kind, "error");
  assert.match(r.message, /NOT sent/);
});

test("network failure -> error that says the message was not sent", async () => {
  mockFetch(() => { throw new TypeError("Failed to fetch"); });
  const r = await submitContact(payload);
  assert.equal(r.kind, "error");
  assert.match(r.message, /NOT sent/);
});

test("aborted request (timeout) -> error", async () => {
  mockFetch(() => { throw Object.assign(new Error("aborted"), { name: "AbortError" }); });
  const r = await submitContact(payload);
  assert.equal(r.kind, "error");
  assert.match(r.message, /timed out/);
});
