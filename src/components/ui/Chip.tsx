"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}

/** Selectable rounded chip — used for subjects, grades, filters (UI brief §2.4). */
export function Chip({ children, selected = false, className, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "bg-violet text-white"
          : "bg-lavender text-ink hover:bg-violet/10 border border-transparent",
        className,
      )}
    >
      {children}
    </button>
  );
}
