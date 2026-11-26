import { useState } from "react";
import ExternalLink from "./ExternalLink.jsx";

const linkClass = "btn btn-outline !px-4 !py-2";

export default function ProjectCard({ project }) {
  const {
    id,
    name,
    label,
    description,
    highlights,
    tech,
    github,
    demo,
    image,
  } = project;

  const [expanded, setExpanded] = useState(false);
  const detailsId = `project-details-${id}`;
  const hasLinks = Boolean(github || demo);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Project Screenshot */}
      <div className="h-48 overflow-hidden bg-roseSoft/60">
        {image ? (
          <img
            src={image}
            alt={`${name} project screenshot`}
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-heading text-lg font-semibold tracking-wide text-roseDeep">
              {name.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="mb-2 inline-block self-start rounded-full bg-roseSoft px-2.5 py-1 text-xs font-semibold text-roseDeep">
          {label}
        </span>

        <h3 className="mb-2 text-xl font-semibold">{name}</h3>
        <p className="text-sm text-inkSoft">{description}</p>

        {highlights && (
          <div className="mt-3">
            <button
              type="button"
              className="text-sm font-semibold text-roseDeep underline-offset-4 hover:underline"
              aria-expanded={expanded}
              aria-controls={detailsId}
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "Hide details" : "View details"}
            </button>

            {expanded && (
              <ul
                id={detailsId}
                className="mt-3 list-disc space-y-1 pl-5 text-sm text-inkSoft"
              >
                {highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <ul
          className="my-4 flex flex-wrap gap-1.5"
          aria-label={`${name} technologies`}
        >
          {tech.map((t) => (
            <li
              key={t}
              className="rounded-full bg-bgAlt px-2.5 py-1 text-xs text-inkSoft"
            >
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-center gap-2.5">
          <ExternalLink
            href={github}
            label={`${name} GitHub`}
            className={linkClass}
          >
            GitHub
          </ExternalLink>

          <ExternalLink
            href={demo}
            label={`${name} live demo`}
            className={linkClass}
          >
            Live Demo
          </ExternalLink>

          {!hasLinks && (
            <span className="text-xs text-inkSoft">Links coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
}