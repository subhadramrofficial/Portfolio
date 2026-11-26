import test from "node:test";
import assert from "node:assert/strict";
import { normalizeProfile, isHttpsUrl, isEmail, isAssetPath } from "../src/lib/links.js";

const base = { name: "X", photo: null, resume: null, email: null, github: null, linkedin: null };

test("null / empty values stay null with no problems", () => {
  const { profile, problems } = normalizeProfile({ ...base, github: "" });
  assert.equal(profile.github, null);
  assert.equal(profile.mailto, null);
  assert.deepEqual(problems, []);
});

test("accepts well-formed values and builds a mailto link", () => {
  const { profile, problems } = normalizeProfile({
    ...base,
    photo: "/profile.jpg",
    resume: "/resume.pdf",
    email: "me@example.com",
    github: "https://github.com/someone",
    linkedin: "https://www.linkedin.com/in/someone",
  });
  assert.deepEqual(problems, []);
  assert.equal(profile.mailto, "mailto:me@example.com");
  assert.equal(profile.github, "https://github.com/someone");
  assert.equal(profile.linkedin, "https://www.linkedin.com/in/someone");
  assert.equal(profile.resume, "/resume.pdf");
});

test("malformed values are dropped and reported", () => {
  const { profile, problems } = normalizeProfile({
    ...base,
    email: "nope",
    github: "http://github.com/x",
    linkedin: "https://evil.example.com/in/x",
    resume: "resume.pdf",
    photo: "//cdn.example.com/p.jpg",
  });
  assert.equal(profile.email, null);
  assert.equal(profile.github, null);
  assert.equal(profile.linkedin, null);
  assert.equal(profile.resume, null);
  assert.equal(profile.photo, null);
  assert.equal(problems.length, 5);
});

test("host checks don't accept look-alike domains", () => {
  assert.equal(isHttpsUrl("https://github.com.evil.io/x", ["github.com"]), false);
  assert.equal(isHttpsUrl("https://notgithub.com/x", ["github.com"]), false);
  assert.equal(isHttpsUrl("https://gist.github.com/x", ["github.com"]), true);
  assert.equal(isHttpsUrl("javascript:alert(1)"), false);
  assert.equal(isEmail("a@b.co"), true);
  assert.equal(isAssetPath("/"), false);
});
