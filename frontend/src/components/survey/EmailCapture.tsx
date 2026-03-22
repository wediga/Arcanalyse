"use client";

import { useState } from "react";

type Props = {
  email: string;
  onSubmit: (email: string) => void;
  onSkip?: () => void;
  headline?: string;
  subtext?: string;
  introHtml?: string;
  introHeadline?: string;
  logoUrl?: string;
};

export default function EmailCapture({
  email: initialEmail,
  onSubmit,
  onSkip,
  headline = "Share your email to stay in the loop",
  subtext = "We'll only send launch updates. No spam.",
  introHtml,
  introHeadline,
  logoUrl,
}: Props) {
  const [email, setEmail] = useState(initialEmail);

  return (
    <div className="text-center">
      {logoUrl && (
        <img
          src={logoUrl}
          alt=""
          className="mx-auto mb-6 h-16 w-auto"
        />
      )}

      {introHeadline && (
        <h1 className="mb-4 font-display text-3xl tracking-tight sm:text-4xl">
          {introHeadline}
        </h1>
      )}

      {introHtml && (
        <div
          className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-text-muted [&_p]:mb-2 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      )}

      <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
        {headline}
      </h2>
      <p className="mt-3 text-text-muted">{subtext}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email) onSubmit(email);
        }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          required={!onSkip}
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-full border border-white/10 bg-bg-surface px-6 py-3.5 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent/40 focus:shadow-[0_0_20px_-6px_rgba(226,181,90,0.2)]"
        />
        <button
          type="submit"
          className="rounded-full border border-accent/30 bg-accent/10 px-8 py-3.5 font-display text-sm tracking-widest text-accent uppercase transition-all hover:border-accent/60 hover:bg-accent/20 hover:shadow-[0_0_30px_-8px_rgba(226,181,90,0.3)]"
        >
          Continue
        </button>
      </form>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-4 text-sm text-text-muted/60 transition-colors hover:text-text-muted"
        >
          Skip for now
        </button>
      )}
    </div>
  );
}
