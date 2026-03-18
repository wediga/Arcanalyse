"use client";

import { useEffect, useRef } from "react";

const painPoints = [
  {
    title: "Numbers don't tell the full story",
    description:
      "Eight goblins against four players? The book says \"Easy.\" But eight attacks per round against four is anything but.",
  },
  {
    title: "Your party matters",
    description:
      "A group without a healer plays completely different than one with. The difficulty rating doesn't know who's at your table.",
  },
  {
    title: "The labels lie",
    description:
      "Some encounters labeled \"Deadly\" are a cakewalk. Some \"Medium\" ones end with everyone rolling new characters. You've been there.",
  },
];

export default function Problem() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll(".fade-up").forEach((child) =>
            child.classList.add("visible")
          );
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="section-pad section-dark">
      <div className="mx-auto max-w-5xl">
        <p className="fade-up font-display text-sm tracking-[0.3em] text-accent-dark uppercase">
          The problem
        </p>
        <h2 className="fade-up delay-1 mt-3 font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
          Difficulty ratings were never built
          <br />
          <span className="text-accent">to predict what actually happens</span>
        </h2>
        <p className="fade-up delay-2 mt-5 max-w-3xl text-lg leading-relaxed text-text-muted sm:text-xl">
          The official difficulty system is a rough estimate. It ignores
          how many actions each side gets, what spells are in play, and who&apos;s
          actually in your party. Every DM who&apos;s trusted it has a story
          about the session that went sideways.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {painPoints.map((point, i) => (
            <div
              key={point.title}
              className={`fade-up delay-${i + 2} card-glow p-7`}
            >
              <span className="corner-ornament corner-ornament--tl" />
              <span className="corner-ornament corner-ornament--br" />
              <h3 className="font-display text-lg text-accent-light">
                {point.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-text-muted">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
