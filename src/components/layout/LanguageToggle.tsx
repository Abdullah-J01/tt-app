"use client";

import { SELECTABLE_LOCALES } from "@/i18n/config";
import { useLocaleSwitch } from "@/i18n/useLocaleSwitch";
import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";

/**
 * Compact segmented EN/ET switch for mobile, where the header has no room for the
 * dropdown LanguageMenu (which stays desktop-only). Both options are always
 * visible; the active one is highlighted. Tapping the inactive one switches the
 * whole site's locale via the same useLocaleSwitch the desktop menu uses.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocaleSwitch();
  const t = useTranslations("common");

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn(
        "border-border bg-surface/70 flex items-center gap-0.5 rounded-full border p-0.5 backdrop-blur",
        className,
      )}
    >
      {SELECTABLE_LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors",
              active ? "bg-violet text-white" : "text-ink/60 hover:text-ink",
            )}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
