"use client";

import { useEffect, useRef } from "react";

export default function SurveyCallout() {
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
      <div className="mx-auto max-w-2xl text-center">
        <p className="fade-up font-display text-sm tracking-[0.3em] text-accent-dark uppercase">
          Shape the tool
        </p>
        <h2 className="fade-up delay-1 mt-3 font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
          Help us get it{" "}
          <span className="text-accent">right</span>
        </h2>
        <p className="fade-up delay-2 mt-5 text-lg leading-relaxed text-text-muted sm:text-xl">
          We&apos;re building Arcanalyse around what DMs actually need.
          A few quick questions go a long way.
        </p>
        <a
          href="/survey"
          className="fade-up delay-3 mt-8 inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/10 px-10 py-4 font-display text-sm tracking-widest text-accent uppercase transition-all hover:border-accent/60 hover:bg-accent/20 hover:shadow-[0_0_30px_-8px_rgba(226,181,90,0.3)]"
        >
          Take the survey
        </a>
      </div>
    </section>
  );
}
