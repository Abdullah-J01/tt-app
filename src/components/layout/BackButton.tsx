"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Reusable "go back" control. Uses history back when possible, otherwise falls
 * back to a provided href (so it works even on a fresh page load / deep link).
 */
export function BackButton({
  fallbackHref = "/explore",
  label = "Back",
  icon,
  className,
}: {
  fallbackHref?: string;
  label?: string;
  /** Replaces the default arrow (e.g. an X for close-style controls). */
  icon?: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <Button
      unstyled
      type="button"
      aria-label={label || "Back"}
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className={cn(
        "text-ink hover:bg-lavender inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors active:scale-95",
        className,
      )}
    >
      {icon ?? <ArrowLeft className="h-5 w-5" />}
      {label && <span className="hidden sm:inline">{label}</span>}
    </Button>
  );
}
