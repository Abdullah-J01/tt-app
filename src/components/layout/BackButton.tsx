"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable "go back" control. Uses history back when possible, otherwise falls
 * back to a provided href (so it works even on a fresh page load / deep link).
 */
export function BackButton({
  fallbackHref = "/explore",
  label = "Back",
  className,
}: {
  fallbackHref?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={label || "Back"}
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink transition-colors hover:bg-lavender active:scale-95",
        className,
      )}
    >
      <ArrowLeft className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
