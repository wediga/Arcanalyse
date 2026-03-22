"use client";

import { useState, useCallback } from "react";
import D20Svg from "@/assets/d20.svg";

export default function D20Icon({ className = "" }: { className?: string }) {
  const [number, setNumber] = useState(20);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<"normal" | "crit" | "fail">("normal");

  const roll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setResult("normal");

    let ticks = 0;
    const maxTicks = 12;
    const interval = setInterval(() => {
      setNumber(Math.floor(Math.random() * 20) + 1);
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * 20) + 1;
        setNumber(final);
        if (final === 20) setResult("crit");
        else if (final === 1) setResult("fail");
        else setResult("normal");
        setRolling(false);
      }
    }, 60);
  }, [rolling]);

  const glowClass =
    result === "crit"
      ? "d20-crit"
      : result === "fail"
        ? "d20-fail"
        : "";

  return (
    <svg
      className={`d20-icon cursor-pointer ${rolling ? "d20-rolling" : ""} ${glowClass} ${className}`}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={roll}
      onClick={roll}
    >
      <D20Svg x="0" y="0" width="100" height="100" />
      <text
        x="50"
        y="53"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontSize="16"
        fontFamily="Cinzel"
        fontWeight="600"
      >
        {number}
      </text>
    </svg>
  );
}
