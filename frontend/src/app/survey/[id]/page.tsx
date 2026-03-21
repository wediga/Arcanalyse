import { notFound } from "next/navigation";
import { getSurvey } from "@/lib/formbricks";
import SurveyRenderer from "@/components/survey/SurveyRenderer";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const survey = await getSurvey(id);
  return {
    title: survey ? `${survey.name} - Arcanalyse` : "Survey - Arcanalyse",
  };
}

export default async function SurveyPage({ params }: Props) {
  const { id } = await params;
  const survey = await getSurvey(id);

  if (!survey || survey.status !== "inProgress") {
    notFound();
  }

  return (
    <main className="section-pad">
      <div className="mx-auto max-w-2xl">
        <SurveyRenderer survey={survey} />
      </div>
    </main>
  );
}
