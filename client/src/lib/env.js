
// Single place that reads Vite environment variables.
const metaEnv = import.meta.env ?? {};

const defaultApiUrl = metaEnv.DEV
  ? "http://localhost:5000"
  : "https://portfolio-zptq.onrender.com";

export const API_URL = (
  metaEnv.VITE_API_URL || defaultApiUrl
).replace(/\/+$/, "");

export const IS_DEV = Boolean(metaEnv.DEV);
