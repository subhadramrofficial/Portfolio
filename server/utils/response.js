// Consistent JSON response envelope.
//   success: { ok: true, ...data }
//   failure: { ok: false, error: { code, message, fields? } }

export function sendOk(res, status, data) {
  return res.status(status).json({ ok: true, ...data });
}

export function sendError(res, status, code, message, fields) {
  const error = { code, message };
  if (fields && Object.keys(fields).length) error.fields = fields;
  return res.status(status).json({ ok: false, error });
}
