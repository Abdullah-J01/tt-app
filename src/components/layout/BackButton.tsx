"use client";

import type { ReactNode } from "react";
import { useTranslations } from "@/i18n/client";
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
  label,
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
  const t = useTranslations("components_layout_BackButton");
  const resolvedLabel = label ?? t("back");

  return (
    <Button
      unstyled
      type="button"
      aria-label={resolvedLabel || t("back")}
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
      {resolvedLabel && <span className="hidden sm:inline">{resolvedLabel}</span>}
    </Button>
  );
}
