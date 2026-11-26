// Single place that reads Vite env vars. `import.meta.env` is undefined outside
// Vite (e.g. in node:test), so fall back to an empty object there.
const metaEnv = import.meta.env ?? {};

export const API_URL = (metaEnv.VITE_API_URL || "/api").replace(/\/+$/, "");
export const IS_DEV = Boolean(metaEnv.DEV);
