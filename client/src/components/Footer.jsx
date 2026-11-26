import ExternalLink from "./ExternalLink.jsx";
import { profile as defaultProfile } from "../data/portfolio.js";

export default function Footer({ profile = defaultProfile }) {
  const linkClass = "text-sm text-inkSoft transition-colors hover:text-ink";
  return (
    <footer className="border-t border-border py-10">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-heading font-bold">{profile.name}</p>
            <p className="text-sm text-inkSoft">{profile.title}</p>
          </div>
          <nav aria-label="Social links" className="flex gap-5">
            <ExternalLink
              href={profile.github}
              label="GitHub"
              className={linkClass}
            >
              GitHub
            </ExternalLink>
            <ExternalLink
              href={profile.linkedin}
              label="LinkedIn"
              className={linkClass}
            >
              LinkedIn
            </ExternalLink>
            <ExternalLink
              href={`mailto:${profile.email}`}
              label="Email"
              className={linkClass}
            >
              Email
            </ExternalLink>
          </nav>
        </div>
        <p className="mt-6 text-xs text-inkSoft">
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
