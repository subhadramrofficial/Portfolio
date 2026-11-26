import useReveal from "../hooks/useReveal.js";
import SectionHeading from "./SectionHeading.jsx";
import ProjectCard from "./ProjectCard.jsx";
import { projects } from "../data/portfolio.js";

export default function Projects() {
  const ref = useReveal();
  return (
    <section id="projects" aria-labelledby="projects-heading" className="section">
      <div ref={ref} className="reveal container-x">
        <SectionHeading id="projects-heading" eyebrow="Projects" title="Things I've built">
          Academic, personal and practice projects that reflect what I've been learning.
        </SectionHeading>
        {projects.length === 0 ? (
          <p className="text-inkSoft">Projects will be added soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
