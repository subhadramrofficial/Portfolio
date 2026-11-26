import { IS_DEV } from "../lib/env.js";

// Renders a link only when `href` is set. Missing links are hidden in production
// (no dead links) and shown as a muted "not set" hint in development.
export default function ExternalLink({ href, label, className = "", children }) {
  if (!href) {
    if (!IS_DEV) return null;
    return (
      <span className={`${className} cursor-not-allowed opacity-50`} title={`"${label}" is not set in src/data/portfolio.js`}>
        {children} <span className="text-xs">(not set)</span>
      </span>
    );
  }
  const isMail = href.startsWith("mailto:");
  return (
    <a href={href} className={className} {...(isMail ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
      {children}
      {!isMail && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
