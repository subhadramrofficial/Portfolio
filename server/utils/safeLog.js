// Logs only non-sensitive details about an error: never request bodies, SMTP
// credentials or connection strings.
export function safeErrorInfo(err) {
  if (!err || typeof err !== "object") return { message: String(err).slice(0, 200) };
  return {
    name: err.name,
    code: err.code,
    responseCode: err.responseCode,
    message: typeof err.message === "string" ? err.message.slice(0, 200) : undefined,
  };
}
