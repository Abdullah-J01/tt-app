import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "default" | "solid" | "green" | "amber";

const variants: Record<Variant, string> = {
  default: "bg-surface text-violet border border-lavender",
  solid: "bg-violet text-white",
  green: "bg-green-tint text-green-dark",
  amber: "bg-amber-tint text-amber-dark",
};

interface PillProps {
  children: ReactNode;
  /** Optional leading icon (e.g. a flame for a streak, an award for a plan). */
  icon?: ReactNode;
  variant?: Variant;
  className?: string;
}

/** Small meta / status pill — price, streak, plan, tags (UI brief §2.4). */
export function Pill({ children, icon, variant = "default", className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold [&_svg]:h-3.5 [&_svg]:w-3.5",
        variants[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
