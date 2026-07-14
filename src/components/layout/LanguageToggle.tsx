"use client";

import { motion } from "framer-motion";
import { SELECTABLE_LOCALES } from "@/i18n/config";
import { useLocaleSwitch } from "@/i18n/useLocaleSwitch";
import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";

/**
 * Compact segmented EN/ET switch for mobile, where the header has no room for the
 * dropdown LanguageMenu (which stays desktop-only). Both options are always
 * visible; a single violet pill slides between them (framer-motion shared
 * `layoutId`) so switching animates smoothly instead of hard-swapping. Tapping the
 * inactive option switches the whole site's locale via useLocaleSwitch.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocaleSwitch();
  const t = useTranslations("common");

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn(
        "border-border bg-surface/70 relative flex items-center gap-0.5 rounded-full border p-0.5 backdrop-blur",
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
              "relative rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors duration-200",
              active ? "text-white" : "text-ink/60 hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId="lang-toggle-pill"
                className="bg-violet absolute inset-0 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{l}</span>
          </button>
        );
      })}
    </div>
  );
}
