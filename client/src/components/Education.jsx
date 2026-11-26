import useReveal from "../hooks/useReveal.js";
import SectionHeading from "./SectionHeading.jsx";
import { education, training } from "../data/portfolio.js";

export default function Education() {
  const ref = useReveal();

  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className="section bg-bgAlt"
    >
      <div ref={ref} className="reveal container-x">
        <SectionHeading
          id="education-heading"
          eyebrow="Education"
          title="Education & training"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-white p-6">
            <p className="text-sm font-semibold text-roseDeep">
              {education.year}
            </p>

            <h3 className="mt-1 text-lg font-semibold">
              {education.degree}
            </h3>

            <p className="text-sm text-inkSoft">
              {education.institution}
            </p>

            {education.cgpa && (
              <p className="mt-3 text-sm font-semibold text-roseDeep">
                CGPA: {education.cgpa}
              </p>
            )}
          </article>

          <article className="rounded-2xl border border-border bg-white p-6">
            <p className="text-sm font-semibold text-roseDeep">
              {training.period} · Technical training
            </p>

            <h3 className="mt-1 text-lg font-semibold">
              {training.title}
            </h3>

            <p className="text-sm text-inkSoft">
              {training.organization}
            </p>

            <ul
              className="mt-3 flex flex-wrap gap-1.5"
              aria-label="Training topics"
            >
              {training.topics.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-bgAlt px-2.5 py-1 text-xs text-inkSoft"
                >
                  {t}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}