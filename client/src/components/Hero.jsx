import { useState } from "react";
import useReveal from "../hooks/useReveal.js";
import { profile as defaultProfile } from "../data/portfolio.js";

function Portrait({ profile }) {
  const [failed, setFailed] = useState(false);
  const showImage = profile.photo && !failed;

  return (
    <div className="relative justify-self-center">
      <div className="absolute -inset-4 rotate-3 rounded-[32px] bg-roseSoft" aria-hidden="true" />
      <div className="relative flex h-[340px] w-[280px] items-center justify-center overflow-hidden rounded-[28px] border border-border bg-bgAlt sm:h-[380px] sm:w-[320px]">
        {showImage ? (
          <img
            src={profile.photo}
            alt={`Portrait of ${profile.name}`}
            width="320"
            height="380"
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div role="img" aria-label={`Profile photo placeholder for ${profile.name}`} className="px-6 text-center text-sm text-inkSoft">
            <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-roseSoft font-heading text-2xl font-bold text-ink">
              {profile.name.charAt(0)}
            </span>
            Your photo goes here
          </div>
        )}
      </div>
    </div>
  );
}

export default function Hero({ profile = defaultProfile }) {
  const ref = useReveal();

  return (
    <section id="home" aria-labelledby="hero-heading" className="container-x">
      <div ref={ref} className="reveal grid grid-cols-1 items-center gap-14 py-14 sm:py-20 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="eyebrow">Hi, I&apos;m</span>
          <h1 id="hero-heading" className="mb-3 text-4xl font-bold leading-tight sm:text-6xl">
            {profile.name}
          </h1>
          <p className="mb-4 text-xl font-semibold">{profile.title}</p>
          <p className="mb-8 max-w-md text-inkSoft">{profile.intro}</p>
          <div className="flex flex-wrap gap-3">
            <a href="#projects" className="btn btn-primary">
              View My Projects
            </a>
            {profile.resume ? (
              <a href={profile.resume} download={profile.resumeFileName} className="btn btn-outline">
                Download Resume
              </a>
            ) : (
              <a href="#contact" className="btn btn-outline">
                Contact Me
              </a>
            )}
          </div>
        </div>
        <Portrait profile={profile} />
      </div>
    </section>
  );
}
