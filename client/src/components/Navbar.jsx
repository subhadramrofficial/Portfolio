import { useEffect, useRef, useState } from "react";
import { profile as defaultProfile } from "../data/portfolio.js";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar({ profile = defaultProfile }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);

  // Escape closes the mobile menu and returns focus to the toggle button.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Resume button downloads the file when it exists, otherwise jumps to the Resume section.
  const resumeProps = profile.resume
    ? { href: profile.resume, download: profile.resumeFileName }
    : { href: "#resume" };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
      <nav aria-label="Main" className="container-x">
        <div className="flex h-[72px] items-center justify-between">
          <a href="#home" className="font-heading text-lg font-bold">
            {profile.name}
          </a>

          <ul className="hidden items-center gap-8 text-sm font-medium md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-inkSoft transition-colors hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a {...resumeProps} className="btn btn-outline hidden !px-4 !py-2 md:inline-flex">
              Resume
            </a>
            <button
              ref={buttonRef}
              type="button"
              className="rounded-lg border border-border bg-white p-2 md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <ul id="mobile-menu" className="flex flex-col border-t border-border pb-3 md:hidden">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block border-b border-border py-3 font-medium">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a {...resumeProps} onClick={() => setOpen(false)} className="block py-3 font-medium text-roseDeep">
                Resume
              </a>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
