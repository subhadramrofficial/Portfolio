// Tiny fakes for req/res so controller + middleware can be tested without Express.
export function fakeRes() {
  return {
    statusCode: 200,
    body: undefined,
    headersSent: false,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; this.headersSent = true; return this; },
  };
}

export function silentLogger() {
  const calls = { error: [] };
  return { calls, error: (...args) => calls.error.push(args), warn() {}, log() {} };
}

export const validBody = () => ({
  name: "  Ada   Lovelace ",
  email: "Ada@Example.com ",
  message: "Hello, I would like to talk about a web developer role.",
});
