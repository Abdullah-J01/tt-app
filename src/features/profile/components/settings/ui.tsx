"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** iOS-style switch. Violet when on (brand). */
export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/40",
        checked ? "bg-violet" : "bg-hairline",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span
        className={cn(
          "inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/** Hairline-separated vertical list. */
export function List({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-hairline border-y border-hairline">{children}</div>;
}

/** Setting row: bold title + optional subtitle on the left, control on the right. */
export function Row({
  title,
  subtitle,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-lg font-bold text-ink">{title}</p>
        {subtitle && <p className="mt-1 text-sm leading-relaxed text-muted">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0 pt-1">{right}</div>}
    </div>
  );
}

/** Bordered value chip (e.g. "9 AM", "1x"). Tapping cycles the value. */
export function ValueChip({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-hairline px-4 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-lavender"
    >
      {children}
    </button>
  );
}
