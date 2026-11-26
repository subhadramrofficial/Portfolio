const metaEnv = import.meta.env ?? {};

const defaultApiUrl = metaEnv.DEV
  ? "http://localhost:5000/api"
  : "https://portfolio-zptq.onrender.com/api";

export const API_URL = (
  metaEnv.VITE_API_URL || defaultApiUrl
).replace(/\/+$/, "");

export const IS_DEV = Boolean(metaEnv.DEV);