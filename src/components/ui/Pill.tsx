import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PillProps {
  children: ReactNode;
  className?: string;
}

/** Small meta / price pill (e.g. "1.90€", "12 cards"). White bg + violet text like TT. */
export function Pill({ children, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-violet",
        className,
      )}
    >
      {children}
    </span>
  );
}
