import useReveal from "../hooks/useReveal.js";
import SectionHeading from "./SectionHeading.jsx";
import { about } from "../data/portfolio.js";

export default function About() {
  const ref = useReveal();
  return (
    <section id="about" aria-labelledby="about-heading" className="section">
      <div ref={ref} className="reveal container-x">
        <SectionHeading id="about-heading" eyebrow="About" title="A little about me" />
        <div className="max-w-2xl space-y-4 text-inkSoft">
          {about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Interests">
          {about.interests.map((i) => (
            <li key={i} className="chip">
              {i}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
