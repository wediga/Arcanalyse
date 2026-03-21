import type { FormbricksQuestion } from "@/lib/formbricks";

type Props = {
  question: FormbricksQuestion;
  value: string;
  onChange: (value: string) => void;
};

export default function Consent({ question, value, onChange }: Props) {
  const accepted = value === "accepted";
  const label =
    question.label?.default ?? question.headline.default;

  return (
    <button
      type="button"
      onClick={() => onChange(accepted ? "dismissed" : "accepted")}
      className={`flex w-full items-center gap-4 rounded-lg border p-5 text-left transition-all ${
        accepted
          ? "border-accent/40 bg-accent/10"
          : "border-white/10 bg-bg-surface hover:border-white/20"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border ${
          accepted
            ? "border-accent bg-accent/20"
            : "border-white/20 bg-transparent"
        }`}
      >
        {accepted && (
          <svg
            viewBox="0 0 12 12"
            fill="none"
            className="h-3.5 w-3.5 text-accent"
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="text-text-primary">{label}</span>
    </button>
  );
}
