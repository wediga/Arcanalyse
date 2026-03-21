import type { FormbricksQuestion } from "@/lib/formbricks";

type Props = {
  question: FormbricksQuestion;
  value: string;
  onChange: (value: string) => void;
};

export default function MultipleChoiceSingle({
  question,
  value,
  onChange,
}: Props) {
  return (
    <div className="grid gap-3">
      {question.choices?.map((choice) => {
        const selected = value === choice.label.default;
        return (
          <button
            key={choice.id}
            type="button"
            onClick={() => onChange(choice.label.default)}
            className={`rounded-lg border p-4 text-left transition-all ${
              selected
                ? "border-accent/40 bg-accent/10 text-text-primary shadow-[0_0_20px_-6px_rgba(226,181,90,0.15)]"
                : "border-white/10 bg-bg-surface text-text-muted hover:border-white/20 hover:bg-bg-surface-hover"
            }`}
          >
            {choice.label.default}
          </button>
        );
      })}
    </div>
  );
}
