import test from "node:test";
import assert from "node:assert/strict";
import { validateContact, LIMITS } from "../src/lib/validation.js";

test("valid input passes and is sanitized", () => {
  const r = validateContact({ name: " Ada  Lovelace ", email: " ADA@Example.com ", message: "  Hello, lovely portfolio!  " });
  assert.equal(r.valid, true);
  assert.deepEqual(r.values, { name: "Ada Lovelace", email: "ada@example.com", message: "Hello, lovely portfolio!" });
});

test("empty form reports all three fields", () => {
  const r = validateContact({});
  assert.equal(r.valid, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ["email", "message", "name"]);
});

test("invalid emails and short/long values are rejected", () => {
  const ok = { name: "Ada", email: "ada@example.com", message: "A message that is long enough." };
  assert.equal(validateContact({ ...ok, email: "not-an-email" }).valid, false);
  assert.equal(validateContact({ ...ok, name: "A" }).valid, false);
  assert.equal(validateContact({ ...ok, message: "short" }).valid, false);
  assert.equal(validateContact({ ...ok, message: "x".repeat(LIMITS.message.max + 1) }).valid, false);
});

test("link-stuffed messages are rejected", () => {
  const r = validateContact({ name: "Ada", email: "a@b.co", message: "http://a.com http://b.com http://c.com http://d.com hi" });
  assert.equal(r.valid, false);
  assert.match(r.errors.message, /links/);
});

test("client and server limits stay in sync", async () => {
  const server = await import("../../server/utils/validation.js").catch(() => null);
  if (!server) return; // client shipped on its own - nothing to compare
  assert.deepEqual(LIMITS, JSON.parse(JSON.stringify(server.LIMITS)));
});
