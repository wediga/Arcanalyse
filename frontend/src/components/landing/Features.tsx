"use client";

import { useEffect, useRef } from "react";

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "Survival odds",
    description:
      "Your party wins 73% of the time, with a 12% chance of a total wipe. Real numbers from simulated fights, not a rough estimate.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 4 5-9" />
      </svg>
    ),
    title: "Round-by-round breakdown",
    description:
      "See how the fight unfolds over time, when it tips, and which rounds get dangerous. Not just the outcome, but the full story.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Hidden dangers",
    description:
      "Some monsters can knock out a character in a single hit. Some abilities shut someone down for multiple rounds. Arcanalyse spots these before your players find out the hard way.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Easy to adjust",
    description:
      "Remove a monster, add another, change the setup. Run it again in seconds and see how the odds shift. Tweak until it feels right.",
  },
];

export default function Features() {
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
          What you get
        </p>
        <h2 className="fade-up delay-1 mt-3 font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
          What you <span className="text-accent">actually learn</span>
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`fade-up delay-${i + 2} card-glow p-8`}
            >
              <span className="corner-ornament corner-ornament--tl" />
              <span className="corner-ornament corner-ornament--br" />
              <div className="text-accent">{feature.icon}</div>
              <h3 className="mt-4 font-display text-lg">{feature.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
