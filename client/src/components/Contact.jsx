import { useRef, useState } from "react";
import useReveal from "../hooks/useReveal.js";
import SectionHeading from "./SectionHeading.jsx";
import ExternalLink from "./ExternalLink.jsx";
import { profile as defaultProfile } from "../data/portfolio.js";
import { validateContact, LIMITS } from "../lib/validation.js";
import { submitContact } from "../api/contact.js";

const EMPTY = { name: "", email: "", message: "", botTrap: "" };

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Contact({ profile = defaultProfile }) {
  const ref = useReveal();
  const [values, setValues] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  // state: idle | submitting | success | partial | error
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const inFlight = useRef(false); // blocks double-submits even before React re-renders
  const refs = { name: useRef(null), email: useRef(null), message: useRef(null) };

  const submitting = status.state === "submitting";

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const focusFirstError = (errors) => {
    const first = ["name", "email", "message"].find((k) => errors[k]);
    if (first) refs[first].current?.focus();
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (inFlight.current) return;

    const { valid, errors, values: clean } = validateContact(values);
    if (!valid) {
      setFieldErrors(errors);
      setStatus({ state: "error", message: "Please fix the highlighted fields and try again." });
      focusFirstError(errors);
      return;
    }

    inFlight.current = true;
    setFieldErrors({});
    setStatus({ state: "submitting", message: "Sending your message…" });

    try {
      const result = await submitContact({ ...clean, botTrap: values.botTrap });

      if (result.kind === "success" || result.kind === "partial") {
        setValues(EMPTY);
        setStatus({ state: result.kind, message: result.message });
      } else if (result.kind === "validation") {
        setFieldErrors(result.fields || {});
        setStatus({ state: "error", message: result.message });
        focusFirstError(result.fields || {});
      } else {
        setStatus({ state: "error", message: result.message });
      }
    } finally {
      inFlight.current = false;
    }
  }

  const describe = (key) => (fieldErrors[key] ? `${key}-error` : undefined);
  const linkClass = "block border-b border-border py-3 font-medium transition-colors hover:text-roseDeep";

  return (
    <section id="contact" aria-labelledby="contact-heading" className="section bg-bgAlt">
      <div ref={ref} className="reveal container-x grid grid-cols-1 gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading id="contact-heading" eyebrow="Contact" title="Let's Connect">
            Open to software and web developer opportunities, collaborations, or a conversation about web development.
          </SectionHeading>
          <div className="flex flex-col">
            <ExternalLink href={profile.mailto} label="Email" className={linkClass}>
              Email{profile.email ? `: ${profile.email}` : ""}
            </ExternalLink>
            <ExternalLink href={profile.github} label="GitHub" className={linkClass}>
              GitHub
            </ExternalLink>
            <ExternalLink href={profile.linkedin} label="LinkedIn" className={linkClass}>
              LinkedIn
            </ExternalLink>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate aria-busy={submitting} className="flex flex-col gap-4" aria-label="Contact form">
          <Field id="contact-name" label="Name" error={fieldErrors.name}>
            <input
              ref={refs.name}
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={LIMITS.name.max}
              value={values.name}
              onChange={onChange}
              disabled={submitting}
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={describe("name")}
              className="field"
            />
          </Field>

          <Field id="contact-email" label="Email" error={fieldErrors.email}>
            <input
              ref={refs.email}
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={LIMITS.email.max}
              value={values.email}
              onChange={onChange}
              disabled={submitting}
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={describe("email")}
              className="field"
            />
          </Field>

          <Field id="contact-message" label="Message" error={fieldErrors.message}>
            <textarea
              ref={refs.message}
              id="contact-message"
              name="message"
              rows={5}
              maxLength={LIMITS.message.max}
              value={values.message}
              onChange={onChange}
              disabled={submitting}
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={describe("message")}
              className="field resize-y"
            />
            <p className="mt-1 text-right text-xs text-inkSoft">
              {values.message.length}/{LIMITS.message.max}
            </p>
          </Field>

          {/* Honeypot: hidden from people and assistive tech; bots tend to fill it in. */}
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="contact-bot-trap">Leave this field empty</label>
            <input id="contact-bot-trap" name="botTrap" type="text" tabIndex={-1} autoComplete="off" value={values.botTrap} onChange={onChange} />
          </div>

          <div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </div>

          <div aria-live="polite" className="min-h-[1.5rem] text-sm">
            {status.state === "submitting" && <p className="text-inkSoft">{status.message}</p>}
            {status.state === "success" && (
              <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-900">{status.message}</p>
            )}
            {status.state === "partial" && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">{status.message}</p>
            )}
            {status.state === "error" && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900">
                {status.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
