import type { FormbricksQuestion } from "@/lib/formbricks";

type Props = {
  question: FormbricksQuestion;
  value: number;
  onChange: (value: number) => void;
};

const SMILEY_ICONS = [
  // 1 - very unhappy
  <svg key="s1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 9.5V9" strokeLinecap="round" />
    <path d="M16 9.5V9" strokeLinecap="round" />
    <path d="M8 17c1-2 3-3 4-3s3 1 4 3" />
  </svg>,
  // 2 - unhappy
  <svg key="s2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 9.5V9" strokeLinecap="round" />
    <path d="M16 9.5V9" strokeLinecap="round" />
    <path d="M9 16c1-1.5 2-2 3-2s2 .5 3 2" />
  </svg>,
  // 3 - neutral
  <svg key="s3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 9.5V9" strokeLinecap="round" />
    <path d="M16 9.5V9" strokeLinecap="round" />
    <path d="M9 15h6" strokeLinecap="round" />
  </svg>,
  // 4 - happy
  <svg key="s4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 9.5V9" strokeLinecap="round" />
    <path d="M16 9.5V9" strokeLinecap="round" />
    <path d="M9 14c1 1.5 2 2 3 2s2-.5 3-2" />
  </svg>,
  // 5 - very happy
  <svg key="s5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 9.5V9" strokeLinecap="round" />
    <path d="M16 9.5V9" strokeLinecap="round" />
    <path d="M8 13c1 2 3 3 4 3s3-1 4-3" />
  </svg>,
];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" strokeWidth="1.5">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
      />
    </svg>
  );
}

function RatingContent({
  scale,
  n,
  value,
  range,
}: {
  scale: string;
  n: number;
  value: number;
  range: number;
}) {
  if (scale === "star") {
    return <StarIcon filled={n <= value} />;
  }

  if (scale === "smiley") {
    const index = Math.round(((n - 1) / (range - 1)) * (SMILEY_ICONS.length - 1));
    return SMILEY_ICONS[index];
  }

  return <>{n}</>;
}

export default function Rating({ question, value, onChange }: Props) {
  const range = question.range ?? 5;
  const scale = question.scale ?? "number";

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: range }, (_, i) => i + 1).map((n) => {
          const selected = scale === "star" ? n <= value : value === n;
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
              <RatingContent scale={scale} n={n} value={value} range={range} />
            </button>
          );
        })}
      </div>
      {question.lowerLabel && question.upperLabel && (
        <div className="mt-3 flex justify-between text-sm text-text-muted/60">
          <span>{question.lowerLabel.default}</span>
          <span>{question.upperLabel.default}</span>
        </div>
      )}
    </div>
  );
}
