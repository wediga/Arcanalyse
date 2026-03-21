import D20Icon from "@/components/landing/D20Icon";

type Props = {
  headline?: string;
  subtext?: string;
};

export default function SurveyComplete({
  headline = "Thank you!",
  subtext = "Your feedback helps us build something worth using.",
}: Props) {
  return (
    <div className="text-center">
      <D20Icon className="mx-auto h-12 w-12 text-accent/40" />
      <h2 className="mt-6 font-display text-3xl tracking-tight sm:text-4xl">
        {headline}
      </h2>
      <p className="mt-4 text-lg text-text-muted">{subtext}</p>
      <a
        href="/"
        className="mt-8 inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/10 px-10 py-4 font-display text-sm tracking-widest text-accent uppercase transition-all hover:border-accent/60 hover:bg-accent/20 hover:shadow-[0_0_30px_-8px_rgba(226,181,90,0.3)]"
      >
        Back to Arcanalyse
      </a>
    </div>
  );
}
