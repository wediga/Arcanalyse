import type { FormbricksQuestion } from "@/lib/formbricks";

type Props = {
  question: FormbricksQuestion;
  value: string[];
  onChange: (value: string[]) => void;
};

export default function MultipleChoiceMulti({
  question,
  value,
  onChange,
}: Props) {
  function toggle(label: string) {
    if (value.includes(label)) {
      onChange(value.filter((v) => v !== label));
    } else {
      onChange([...value, label]);
    }
  }

  return (
    <div className="grid gap-3">
      {question.choices?.map((choice) => {
        const selected = value.includes(choice.label.default);
        return (
          <button
            key={choice.id}
            type="button"
            onClick={() => toggle(choice.label.default)}
            className={`rounded-lg border p-4 text-left transition-all ${
              selected
                ? "border-accent/40 bg-accent/10 text-text-primary shadow-[0_0_20px_-6px_rgba(226,181,90,0.15)]"
                : "border-white/10 bg-bg-surface text-text-muted hover:border-white/20 hover:bg-bg-surface-hover"
            }`}
          >
            <span className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  selected
                    ? "border-accent bg-accent/20"
                    : "border-white/20 bg-transparent"
                }`}
              >
                {selected && (
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    className="h-3 w-3 text-accent"
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
              {choice.label.default}
            </span>
          </button>
        );
      })}
    </div>
  );
}
