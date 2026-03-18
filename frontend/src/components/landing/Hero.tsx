"use client";

import { useEffect, useRef } from "react";
import D20Icon from "./D20Icon";

export default function Hero() {
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
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <div className="fade-up mb-8">
        <D20Icon className="mx-auto h-20 w-20 text-accent" />
      </div>

      <h1 className="fade-up delay-1 font-display text-5xl leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
        Your party enters the room.
        <br />
        <span className="text-accent">Do they walk out?</span>
      </h1>

      <p className="fade-up delay-2 mt-8 max-w-2xl text-xl leading-relaxed text-text-muted sm:text-2xl">
        That encounter you spent an hour prepping?
        <br />
        It could be a cakewalk or a funeral.
        <br />
        Test it before your players do.
      </p>

      <div className="fade-up delay-3 mt-6">
        <div className="glow-line" />
      </div>

      <a
        href="#signup"
        className="fade-up delay-4 mt-10 inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/10 px-12 py-5 font-display text-base tracking-widest text-accent uppercase transition-all hover:border-accent/60 hover:bg-accent/20 hover:shadow-[0_0_30px_-8px_rgba(226,181,90,0.3)]"
      >
        Get early access
      </a>

      {/* Scroll indicator */}
      <div className="fade-up delay-5 absolute bottom-10 animate-bounce">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-text-muted"
        >
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    </section>
  );
}
