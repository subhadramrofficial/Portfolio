import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Skills from "./components/Skills.jsx";
import Projects from "./components/Projects.jsx";
import Education from "./components/Education.jsx";
import Resume from "./components/Resume.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import { profileProblems } from "./data/portfolio.js";
import { IS_DEV } from "./lib/env.js";

export default function App() {
  useEffect(() => {
    if (IS_DEV) profileProblems.forEach((p) => console.warn(`[portfolio config] ${p}`));
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Education />
        <Resume />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
