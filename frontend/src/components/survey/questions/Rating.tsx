import type { FormbricksQuestion } from "@/lib/formbricks";

type Props = {
  question: FormbricksQuestion;
  value: number;
  onChange: (value: number) => void;
};

export default function Rating({ question, value, onChange }: Props) {
  const range = question.range ?? 5;

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {Array.from({ length: range }, (_, i) => i + 1).map((n) => {
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex h-12 w-12 items-center justify-center rounded-full border font-display text-lg transition-all ${
              selected
                ? "border-accent bg-accent/15 text-accent shadow-[0_0_20px_-6px_rgba(226,181,90,0.25)]"
                : "border-white/10 bg-bg-surface text-text-muted hover:border-white/20 hover:bg-bg-surface-hover"
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
