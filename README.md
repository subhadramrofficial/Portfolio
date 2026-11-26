# Subhadra M.R. — MERN Portfolio (v2)

React + Tailwind CSS frontend and an Express + MongoDB backend. The contact form validates on both
sides, saves each message to MongoDB, and sends you an email notification via Nodemailer/SMTP.

```
portfolio-mern-v2/
├── client/   React (Vite) + Tailwind CSS
│   └── src/data/portfolio.js   ← edit your content here
└── server/   Express + Mongoose + Nodemailer
    ├── config/  controllers/  middleware/  models/  routes/  services/  utils/  tests/
    └── .env.example
```

## 1. Quick start (local)

Prerequisites: Node.js 18+ (20/22 recommended), a MongoDB Atlas account (free tier is fine), and SMTP
credentials (optional while developing).

```bash
# 1. Install
npm run install:all            # or: (cd server && npm i) && (cd client && npm i)

# 2. Configure the backend
cp server/.env.example server/.env
#   → open server/.env and fill in MONGODB_URI (+ SMTP_* when ready). See sections 2 and 3.

# 3. (Optional) configure the frontend. Locally it works without this thanks to the Vite proxy.
cp client/.env.example client/.env

# 4. Run (two terminals)
npm run dev:server             # API on http://localhost:5000
npm run dev:client             # site on http://localhost:5173
```

Check the API: `curl http://localhost:5000/api/health`

> **Secrets:** only ever type real passwords/connection strings into your own `server/.env` (or your
> host's environment-variable settings). `.env` is git-ignored. Never paste them into chats,
> issues or commits, and never put secrets in `client/` — everything in `VITE_*` is public.

## 2. MongoDB Atlas setup

1. Create a free account at https://www.mongodb.com/atlas and create a **free (M0) cluster**.
2. **Database Access → Add New Database User.** Choose a username + a strong auto-generated password,
   and give it the *Read and write to any database* role (or restrict it to the `portfolio` database).
   Save the password somewhere safe (a password manager).
3. **Network Access → Add IP Address.** For local development choose *Add Current IP Address*.
   For a deployed backend whose IP isn't fixed (Render/Railway free tiers), you'll need to allow
   `0.0.0.0/0`; this is common but means the database user's password is your only protection, so use a
   long random password and a least-privilege user.
4. **Database → Connect → Drivers.** Copy the connection string. It looks like
   `mongodb+srv://<db_user>:<db_password>@<cluster-host>/?retryWrites=true&w=majority`.
5. In `server/.env`, set `MONGODB_URI` to that string, replacing `<db_user>` and `<db_password>`, and add
   the database name before the `?` (e.g. `.../portfolio?retryWrites=true&w=majority`).
   If the password contains special characters (`@ : / ? # %`), URL-encode them.
6. Start the server. You should see `[db] MongoDB connected`. Submitted messages appear in
   **Atlas → Browse Collections → portfolio → contactmessages**.

## 3. SMTP / email setup

Notifications are sent from your server with Nodemailer. Any SMTP provider works (Gmail, Brevo,
SendGrid, Mailgun, Zoho, your domain's mail host…). Set these in `server/.env`:

| Variable | Meaning |
| --- | --- |
| `SMTP_HOST` | Provider's SMTP host, e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `587` (STARTTLS, use `SMTP_SECURE=false`) or `465` (use `SMTP_SECURE=true`) |
| `SMTP_USER` / `SMTP_PASS` | SMTP username and password |
| `SMTP_FROM` | The "From" address, e.g. `"Portfolio Contact <you@gmail.com>"`. Many providers require it to match a verified sender/your account |
| `CONTACT_RECIPIENT_EMAIL` | The inbox that receives the notifications |

**Gmail:** turn on 2-Step Verification, then create an **App Password** (Google Account → Security →
App passwords) and use that 16-character value as `SMTP_PASS`. Your normal Gmail password will not
work. Check your provider's current docs, as requirements change.

**Safe credential handling**
- Keep credentials in `server/.env` locally and in the host's secret/env settings in production.
- Use an app password or a dedicated SMTP/API key, never your main account password. Revoke and rotate it if it
  is ever exposed.
- The server never logs credentials or message bodies, and never sends them to the browser.
- At startup the server logs whether SMTP credentials verify (`[mail] SMTP connection verified`).

If SMTP is blank or wrong, the site still works: messages are **saved**, and visitors are told honestly
that the notification email could not be sent.

## 4. Customize your content

Everything lives in **`client/src/data/portfolio.js`**: name, intro, links, skills, projects,
education and training. Anything set to `null` is hidden (never rendered as a dead link).

- **Profile photo:** copy your photo to `client/public/profile.jpg` and set `photo: "/profile.jpg"`.
  Until then a neutral placeholder is shown. Alt text is generated automatically.
- **Resume:** copy your PDF to `client/public/Subhadra_MR_Resume.pdf` and set
  `resume: "/Subhadra_MR_Resume.pdf"`. Until then the site says the resume is available on request
  and offers a "Contact" button instead of a broken download.
- **Links:** set `email`, `github` (`https://github.com/...`) and `linkedin` (`https://...linkedin.com/...`).
  Malformed values are ignored and reported in the browser console during development.
- **Projects:** add `github` / `demo` URLs per project when they exist. Only add `highlights` that are true.

## 5. API reference

All responses are JSON. Success: `{ "ok": true, ... }`. Failure: `{ "ok": false, "error": { "code", "message", "fields"? } }`.

### `POST /api/contact`
Request body (`Content-Type: application/json`):
```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "message": "Hello, I'd like to talk." }
```
Rules: name 2–100 chars; valid email ≤254; message 10–2000 chars with at most 3 links. Input is trimmed,
control/zero-width characters are stripped, email is lower-cased. Non-string values are rejected.
A hidden `botTrap` field must be empty or the request is rejected.

| Status | `error.code` / body | Meaning |
| --- | --- | --- |
| 201 | `{ ok, saved: true, notified: true }` | Saved and notification email sent |
| 201 | `{ ok, saved: true, notified: false }` | Saved, but the email could not be sent (logged server-side) |
| 400 | `VALIDATION_ERROR` (+ `fields`), `INVALID_JSON`, `SUBMISSION_REJECTED` | Bad input |
| 403 | `CORS_NOT_ALLOWED` | Browser origin not in `CLIENT_ORIGIN` |
| 413 | `PAYLOAD_TOO_LARGE` | Body over 10 KB |
| 429 | `RATE_LIMITED` | 5 messages/IP/hour, 100 API requests/IP/15 min |
| 500 | `SAVE_FAILED`, `INTERNAL_ERROR` | Nothing was saved. **Never** reported as success |
| 503 | `SERVICE_UNAVAILABLE` | Database not connected; nothing saved |

### `GET /api/health`
`200 { ok: true, status: "ok", uptimeSeconds, database: "connected", emailConfigured: true|false }`, or
`503` with `status: "degraded"` when the database is disconnected. It reveals no secrets.

There is **no endpoint that lists messages**. Read them in Atlas (or add an authenticated admin
route yourself later; never ship default admin credentials).

## 6. Testing

```bash
npm test          # runs server tests (33) and client tests (18) with Node's built-in runner, no extra deps
```

What the automated tests cover: validation/sanitization rules (including operator-injection and
header-injection attempts), the contact controller (save → email → honest status for every failure
path, honeypot, DB-down), the email service (with a fake transport), the central error handler, link
normalization, and the browser API client against every response type.

**Manual end-to-end check** (needs your real `.env`):
1. `curl localhost:5000/api/health` → `status: "ok"`, `emailConfigured: true`.
2. Submit the form on http://localhost:5173 → green success message, a document appears in Atlas, and an
   email arrives at `CONTACT_RECIPIENT_EMAIL` (check spam).
3. Break SMTP on purpose (wrong `SMTP_PASS`), restart, submit → amber "received, but notification
   could not be sent" message, and the document has `notificationStatus: "failed"`.
4. Stop the server, submit → red "couldn't reach the server… NOT sent" message.
5. Submit 6 times quickly → the 6th returns the rate-limit message.
6. Open DevTools → Console/Network: no errors; `POST /api/contact` returns 201.

Curl equivalent:
```bash
curl -i -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Testing the contact endpoint."}'
```

## 7. Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| Server exits: `MONGODB_URI is required` | `server/.env` missing or not in the `server/` folder |
| `Could not connect to MongoDB (MongoServerSelectionError)` | Atlas Network Access doesn't include your IP; wrong user/password; password needs URL-encoding |
| `[mail] SMTP verification failed (EAUTH)` | Wrong credentials. For Gmail use an App Password |
| `ECONNECTION` / `ETIMEDOUT` on email | Wrong host/port, or your network blocks port 587/465. Try the other port with the matching `SMTP_SECURE` |
| Form says "Couldn't reach the server" | Backend not running, or `VITE_API_URL` wrong (must end in `/api`) |
| Browser console: CORS error / `CORS_NOT_ALLOWED` | `CLIENT_ORIGIN` must exactly match the site's origin (scheme + host + port, no trailing slash) |
| Always rate-limited in production | Set `TRUST_PROXY=1` so the real client IP is used instead of the proxy's |
| Resume/photo not showing | File must be in `client/public/` and the path in `portfolio.js` must start with `/` |
| Changed `.env` but nothing changed | Restart the server (and the Vite dev server for `client/.env`) |

## 8. Deployment

**Order:** deploy the backend first, then the frontend, then update `CLIENT_ORIGIN`.

### Backend (Render, Railway, Fly.io, etc.)
- Root directory: `server` · Build: `npm install` · Start: `npm start`
- Environment variables (set in the host dashboard, **not** in git):
  `NODE_ENV=production`, `MONGODB_URI`, `CLIENT_ORIGIN`, `TRUST_PROXY=1`, `SMTP_HOST`, `SMTP_PORT`,
  `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_RECIPIENT_EMAIL`
  (`PORT` is usually provided by the host.)
- Verify: `https://<your-api-host>/api/health`

### Frontend (Vercel, Netlify, Cloudflare Pages, etc.)
- Root directory: `client` · Build: `npm run build` · Output: `dist`
- Environment variable: `VITE_API_URL=https://<your-api-host>/api` (set it **before** building, because
  Vite inlines it at build time).
- It's a single-page site with anchor links, so no rewrite rules are needed.

### CORS in production
`CLIENT_ORIGIN` must be the exact origin of the deployed frontend, e.g. `https://your-portfolio.vercel.app`.
For several origins (e.g. custom domain + preview URL) separate them with commas. In production the
server refuses to start if `CLIENT_ORIGIN` is empty.

## 9. Security notes
- Helmet security headers, strict CORS allow-list, 10 KB body limit, per-route rate limiting.
- Server-side validation is authoritative; the client copy is for UX only.
- Spam controls: honeypot field, link-count limit, rate limiting.
- Emails are plain text (no HTML injection) and header values are stripped of line breaks.
- Errors return generic messages; internals and secrets are never sent to the client or logged.
