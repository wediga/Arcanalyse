import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum - Arcanalyse",
};

export default function Impressum() {
  return (
    <main className="section-pad mx-auto max-w-2xl">
      <h1 className="font-display text-3xl text-accent">Impressum</h1>
      <div className="glow-line mt-4 !max-w-[80px] !mx-0" />

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-text-muted">
        <section>
          <h2 className="font-display text-lg text-text-primary">
            Angaben gem. 5 TMG
          </h2>
          <p className="mt-2">
            Alexander Wedig
            <br />
            {/* Address to be added */}
            <br />
            E-Mail: contact@arcanalyse.com
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-text-primary">
            Haftungsausschluss
          </h2>
          <p className="mt-2">
            Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für die
            Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird jedoch
            keine Gewähr übernommen.
          </p>
        </section>
      </div>

      <a href="/" className="accent-link mt-12 inline-block text-sm">
        &larr; Back to Arcanalyse
      </a>
    </main>
  );
}
