import test from "node:test";
import assert from "node:assert/strict";
import { validateContact, sanitizeMessage, countLinks, LIMITS } from "../utils/validation.js";

const base = { name: "Ada Lovelace", email: "ada@example.com", message: "A perfectly reasonable message." };

test("accepts a valid payload and sanitizes it", () => {
  const r = validateContact({ name: "  Ada   Lovelace ", email: " Ada@Example.COM ", message: "  Hello there, nice site!  " });
  assert.equal(r.valid, true);
  assert.deepEqual(r.values, { name: "Ada Lovelace", email: "ada@example.com", message: "Hello there, nice site!" });
});

test("rejects missing fields", () => {
  const r = validateContact({});
  assert.equal(r.valid, false);
  assert.ok(r.errors.name && r.errors.email && r.errors.message);
});

test("rejects non-object bodies", () => {
  for (const bad of [null, undefined, "x", 5, [], true]) {
    assert.equal(validateContact(bad).valid, false);
  }
});

test("rejects non-string values (NoSQL operator injection)", () => {
  const r = validateContact({ ...base, email: { $ne: "" } });
  assert.equal(r.valid, false);
  assert.match(r.errors.email, /must be text/);
  assert.equal(validateContact({ ...base, name: ["a", "b"] }).valid, false);
});

test("rejects invalid email addresses", () => {
  for (const email of ["plain", "a@b", "a@@b.com", "a b@c.com", "<x>@y.com", "a@b..com", "a@-b.com", "a".repeat(250) + "@x.com"]) {
    assert.equal(validateContact({ ...base, email }).valid, false, `should reject ${email}`);
  }
  for (const email of ["a@b.co", "first.last+tag@sub.example.org"]) {
    assert.equal(validateContact({ ...base, email }).valid, true, `should accept ${email}`);
  }
});

test("enforces length limits", () => {
  assert.equal(validateContact({ ...base, name: "A" }).valid, false);
  assert.equal(validateContact({ ...base, name: "A".repeat(LIMITS.name.max + 1) }).valid, false);
  assert.equal(validateContact({ ...base, message: "short" }).valid, false);
  assert.equal(validateContact({ ...base, message: "x".repeat(LIMITS.message.max + 1) }).valid, false);
  assert.equal(validateContact({ ...base, message: "x".repeat(LIMITS.message.max) }).valid, true);
});

test("whitespace-only fields count as empty", () => {
  const r = validateContact({ name: "   ", email: "  ", message: " \n\n " });
  assert.equal(r.valid, false);
  assert.ok(r.errors.name && r.errors.email && r.errors.message);
});

test("strips line breaks from name so it can't inject mail headers", () => {
  const r = validateContact({ ...base, name: "Ada\r\nBcc: evil@example.com" });
  assert.equal(r.valid, true);
  assert.ok(!/[\r\n]/.test(r.values.name));
});

test("strips control and zero-width characters", () => {
  const r = validateContact({ ...base, message: "Hel\u0000lo\u200B wor\u0007ld, this is long enough" });
  assert.equal(r.values.message, "Hello world, this is long enough");
});

test("normalizes message newlines and collapses blank lines", () => {
  assert.equal(sanitizeMessage("a\r\n\r\n\r\n\r\nb"), "a\n\nb");
});

test("flags link-stuffed messages as spam", () => {
  const spam = "buy http://a.com http://b.com http://c.com http://d.com now please";
  assert.equal(countLinks(spam), 4);
  const r = validateContact({ ...base, message: spam });
  assert.equal(r.valid, false);
  assert.match(r.errors.message, /links/);
  assert.equal(validateContact({ ...base, message: "see https://a.com and www.b.com for my work" }).valid, true);
});
