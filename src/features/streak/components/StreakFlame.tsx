"use client";

import { Flame } from "lucide-react";

interface StreakFlameProps {
  size?: number;
  lit?: boolean;
  className?: string;
}

export function StreakFlame({ size = 40, lit = true, className }: StreakFlameProps) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-full ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {lit && (
        <span
          className="absolute inset-0 rounded-full blur-md"
          style={{ background: "radial-gradient(circle, var(--color-amber) 0%, transparent 70%)" }}
        />
      )}
      <span
        className="relative grid h-full w-full place-items-center rounded-full"
        style={{
          background: lit
            ? "radial-gradient(circle at 50% 35%, #ffd27a 0%, var(--color-amber) 55%, var(--color-amber-dark) 100%)"
            : "var(--color-mist)",
          boxShadow: lit ? "0 6px 18px -4px rgba(232, 137, 43, 0.6)" : "none",
        }}
      >
        <Flame
          size={size * 0.5}
          className={lit ? "text-white" : "text-faint"}
          fill={lit ? "currentColor" : "none"}
          strokeWidth={lit ? 1.5 : 2}
        />
      </span>
    </span>
  );
}
