import { redirect } from "next/navigation";
import { getSurveys } from "@/lib/formbricks";
import type { Metadata } from "next";
import D20Icon from "@/components/landing/D20Icon";

export const metadata: Metadata = {
  title: "Surveys - Arcanalyse",
  description: "Help us build the right tool. Take a quick survey.",
};

export default async function SurveyOverview() {
  const surveys = await getSurveys();

  if (surveys.length === 1) {
    redirect(`/survey/${surveys[0].id}`);
  }

  return (
    <main className="section-pad">
      <div className="mx-auto max-w-2xl text-center">
        <D20Icon className="mx-auto h-12 w-12 text-accent/40" />
        <h1 className="mt-6 font-display text-3xl tracking-tight sm:text-4xl">
          {surveys.length === 0 ? (
            "No active surveys right now"
          ) : (
            <>
              Help us build{" "}
              <span className="text-accent">the right tool</span>
            </>
          )}
        </h1>

        {surveys.length === 0 && (
          <p className="mt-4 text-lg text-text-muted">
            Check back soon, or{" "}
            <a href="/#signup" className="accent-link">
              sign up for updates
            </a>
            .
          </p>
        )}

        {surveys.length > 1 && (
          <div className="mt-10 grid gap-4">
            {surveys.map((survey) => (
              <a
                key={survey.id}
                href={`/survey/${survey.id}`}
                className="card-glow block p-6 text-left transition-colors"
              >
                <span className="corner-ornament corner-ornament--tl" />
                <span className="corner-ornament corner-ornament--br" />
                <h2 className="font-display text-lg">{survey.name}</h2>
                <p className="mt-1 text-sm text-text-muted">
                  {survey.questions.length} question
                  {survey.questions.length !== 1 && "s"}
                </p>
              </a>
            ))}
          </div>
        )}

        <a
          href="/"
          className="mt-10 inline-block text-sm text-text-muted accent-link"
        >
          Back to Arcanalyse
        </a>
      </div>
    </main>
  );
}
