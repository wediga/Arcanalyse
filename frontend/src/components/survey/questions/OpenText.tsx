import type { FormbricksQuestion } from "@/lib/formbricks";

type Props = {
  question: FormbricksQuestion;
  value: string;
  onChange: (value: string) => void;
};

export default function OpenText({ question, value, onChange }: Props) {
  const isLongText =
    question.inputType === "text" && !question.placeholder?.default;
  const placeholder =
    question.placeholder?.default ?? "Type your answer here...";

  if (isLongText) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-lg border border-white/10 bg-bg-surface px-5 py-3.5 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent/40 focus:shadow-[0_0_20px_-6px_rgba(226,181,90,0.2)] resize-none"
      />
    );
  }

  return (
    <input
      type={question.inputType === "email" ? "email" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-full border border-white/10 bg-bg-surface px-6 py-3.5 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent/40 focus:shadow-[0_0_20px_-6px_rgba(226,181,90,0.2)]"
    />
  );
}
