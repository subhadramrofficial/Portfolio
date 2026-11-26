import useReveal from "../hooks/useReveal.js";
import SectionHeading from "./SectionHeading.jsx";
import { profile as defaultProfile } from "../data/portfolio.js";
import { IS_DEV } from "../lib/env.js";

export default function Resume({ profile = defaultProfile }) {
  const ref = useReveal();
  return (
    <section id="resume" aria-labelledby="resume-heading" className="section">
      <div ref={ref} className="reveal container-x">
        <SectionHeading id="resume-heading" eyebrow="Resume" title="Want the full picture?" />
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          {profile.resume ? (
            <>
              <p className="text-inkSoft">Download my resume as a PDF.</p>
              <a href={profile.resume} download={profile.resumeFileName} className="btn btn-primary">
                Download Resume
              </a>
            </>
          ) : (
            <>
              <div>
                <p className="text-inkSoft">My resume is available on request.</p>
                {IS_DEV && (
                  <p className="mt-1 text-xs text-roseDeep">
                    Dev hint: put your PDF in client/public/ and set <code>profile.resume</code> in src/data/portfolio.js.
                  </p>
                )}
              </div>
              <a href="#contact" className="btn btn-primary">
                Get in touch
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
