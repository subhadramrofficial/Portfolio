import useReveal from "../hooks/useReveal.js";
import SectionHeading from "./SectionHeading.jsx";
import { skillGroups } from "../data/portfolio.js";

export default function Skills() {
  const ref = useReveal();
  return (
    <section id="skills" aria-labelledby="skills-heading" className="section bg-bgAlt">
      <div ref={ref} className="reveal container-x">
        <SectionHeading id="skills-heading" eyebrow="Skills" title="Technologies I work with">
          The tools I currently use to build web applications.
        </SectionHeading>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 font-semibold text-roseDeep">{group.title}</h3>
              <ul className="flex flex-wrap gap-2">
                {group.skills.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
