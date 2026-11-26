// Validates the links/assets in the profile config so a typo can never produce a
// broken or malformed link. Invalid or missing values become `null`, and the UI
// simply hides that link (and, in dev, shows a "not set" hint).

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function isHttpsUrl(value, allowedHosts) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    if (!allowedHosts) return true;
    return allowedHosts.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export const isEmail = (value) => typeof value === "string" && EMAIL_RE.test(value);

// A public asset path ("/resume.pdf") or an https URL.
export function isAssetPath(value) {
  return typeof value === "string" && ((value.startsWith("/") && !value.startsWith("//") && value.length > 1) || isHttpsUrl(value));
}

/** Returns { profile, problems }. `problems` lists config values that were set but invalid. */
export function normalizeProfile(raw) {
  const problems = [];
  const pick = (key, ok) => {
    const v = raw[key];
    if (v === null || v === undefined || v === "") return null;
    if (ok(v)) return v;
    problems.push(`profile.${key} is set but not valid: ${JSON.stringify(v)}`);
    return null;
  };

  const email = pick("email", isEmail);
  const profile = {
    ...raw,
    photo: pick("photo", isAssetPath),
    resume: pick("resume", isAssetPath),
    email,
    mailto: email ? `mailto:${email}` : null,
    github: pick("github", (v) => isHttpsUrl(v, ["github.com"])),
    linkedin: pick("linkedin", (v) => isHttpsUrl(v, ["linkedin.com"])),
  };
  return { profile, problems };
}
