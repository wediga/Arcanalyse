"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import D20Icon from "./D20Icon";

export default function Signup() {
  const ref = useRef<HTMLElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    const listmonkUrl = process.env.NEXT_PUBLIC_LISTMONK_URL;
    if (!listmonkUrl) {
      localStorage.setItem("arcanalyse_email", email);
      setStatus("success");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(`${listmonkUrl}/api/public/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: "",
          list_uuids: [process.env.NEXT_PUBLIC_LISTMONK_LIST_UUID],
        }),
      });
      if (res.ok) {
        localStorage.setItem("arcanalyse_email", email);
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section ref={ref} id="signup" className="section-pad">
      <div className="mx-auto max-w-2xl text-center">
        <div className="fade-up">
          <D20Icon className="mx-auto h-12 w-12 text-accent/40" />
        </div>
        <h2 className="fade-up delay-1 mt-6 font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
          Get notified <span className="text-accent">at launch</span>
        </h2>
        <p className="fade-up delay-2 mt-4 text-lg leading-relaxed text-text-muted sm:text-xl">
          Arcanalyse is currently being built. Drop your email and
          we&apos;ll let you know when it&apos;s ready to try.
        </p>

        <form
          onSubmit={handleSubmit}
          className="fade-up delay-3 mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full border border-white/10 bg-bg-surface px-6 py-3.5 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent/40 focus:shadow-[0_0_20px_-6px_rgba(226,181,90,0.2)]"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full border border-accent/30 bg-accent/10 px-8 py-3.5 font-display text-sm tracking-widest text-accent uppercase transition-all hover:border-accent/60 hover:bg-accent/20 hover:shadow-[0_0_30px_-8px_rgba(226,181,90,0.3)] disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Notify me"}
          </button>
        </form>

        {status === "success" && (
          <div className="mt-4">
            <p className="text-sm text-accent">
              You&apos;re on the list. We&apos;ll send word when it&apos;s ready.
            </p>
            <Link
              href="/survey"
              className="mt-2 inline-block text-sm text-text-muted accent-link"
            >
              Help us build the right tool - take a quick survey
            </Link>
          </div>
        )}
        {status === "error" && (
          <p className="mt-4 text-sm text-red-400">
            Something went wrong. Please try again.
          </p>
        )}

        <p className="fade-up delay-4 mt-6 text-xs text-text-muted/60">
          No spam. Unsubscribe anytime. Just launch updates and early access.
        </p>
      </div>
    </section>
  );
}
