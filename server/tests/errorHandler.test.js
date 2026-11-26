import test from "node:test";
import assert from "node:assert/strict";
import { createErrorHandler, notFound } from "../middleware/errorHandler.js";
import { fakeRes, silentLogger } from "./helpers.js";

const handle = (err, res = fakeRes(), logger = silentLogger()) => {
  let forwarded;
  createErrorHandler(logger)(err, {}, res, (e) => { forwarded = e; });
  return { res, forwarded, logger };
};

test("maps malformed JSON to 400", () => {
  const { res } = handle(Object.assign(new Error("bad"), { type: "entity.parse.failed" }));
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.code, "INVALID_JSON");
});

test("maps oversized bodies to 413", () => {
  const { res } = handle(Object.assign(new Error("big"), { type: "entity.too.large" }));
  assert.equal(res.statusCode, 413);
});

test("maps CORS rejections to 403", () => {
  const { res } = handle(Object.assign(new Error("cors"), { code: "CORS_NOT_ALLOWED" }));
  assert.equal(res.statusCode, 403);
});

test("unknown errors become a generic 500 with no internals leaked", () => {
  const { res, logger } = handle(new Error("secret db password in message"));
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.ok, false);
  assert.ok(!JSON.stringify(res.body).includes("secret"));
  assert.equal(logger.calls.error.length, 1);
});

test("delegates to Express when headers were already sent", () => {
  const res = fakeRes();
  res.headersSent = true;
  const err = new Error("late");
  const { forwarded } = handle(err, res);
  assert.equal(forwarded, err);
});

test("404 handler uses the standard envelope", () => {
  const res = fakeRes();
  notFound({}, res);
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.ok, false);
});
