"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    number: "I",
    title: "Set up the fight",
    description:
      "Tell Arcanalyse who's in your party and what they're up against. Pick from hundreds of monsters or add your own.",
  },
  {
    number: "II",
    title: "Let it play out",
    description:
      "Arcanalyse simulates the encounter over and over. Attacks, spells, abilities, everything. Like running the fight a thousand times in fast-forward.",
  },
  {
    number: "III",
    title: "See what happens",
    description:
      "How often does the party win? How often does everyone die? How long does the fight last? Plus tips to make it easier or harder.",
  },
];

export default function Solution() {
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
    <section ref={ref} className="section-pad section-accent-tint">
      <div className="mx-auto max-w-5xl">
        <p className="fade-up font-display text-sm tracking-[0.3em] text-accent-dark uppercase">
          How it works
        </p>
        <h2 className="fade-up delay-1 mt-3 font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
          Stop guessing.{" "}
          <span className="text-accent">Know.</span>
        </h2>
        <p className="fade-up delay-2 mt-5 max-w-3xl text-lg leading-relaxed text-text-muted sm:text-xl">
          Arcanalyse doesn&apos;t use a formula. It actually plays out the fight.
          Both sides make smart decisions, just like real players would.
          The result: real odds, not rough estimates.
        </p>

        <div className="mt-10 grid gap-0 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`fade-up delay-${i + 2} relative border-l border-border-subtle p-8 pl-10 md:border-l md:first:border-l-0`}
            >
              <span className="font-display text-6xl leading-none text-accent/50">
                {step.number}
              </span>
              <h3 className="mt-3 font-display text-xl">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-text-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
