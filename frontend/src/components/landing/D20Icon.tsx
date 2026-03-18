export default function D20Icon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`d20-icon ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polygon points="50,2 97,36 79,93 21,93 3,36" />
      <line x1="50" y1="2" x2="21" y2="93" />
      <line x1="50" y1="2" x2="79" y2="93" />
      <line x1="97" y1="36" x2="21" y2="93" />
      <line x1="3" y1="36" x2="79" y2="93" />
      <line x1="3" y1="36" x2="97" y2="36" />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="20"
        fontFamily="Cinzel"
        fontWeight="600"
      >
        20
      </text>
    </svg>
  );
}
