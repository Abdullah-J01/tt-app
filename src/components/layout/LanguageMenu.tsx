"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SELECTABLE_LOCALES, type Locale } from "@/i18n/config";
import { useLocaleSwitch } from "@/i18n/useLocaleSwitch";
import { useTranslations } from "@/i18n/client";

/** Short name shown on the toggle (in the language's own tongue). */
const SHORT_LABELS: Record<Locale, string> = {
  en: "English",
  et: "Eesti",
  ru: "Русский",
};

/** Full option labels shown in the dropdown ("in <language>"). */
const OPTION_LABELS: Record<Locale, string> = {
  en: "English",
  et: "Eesti keeles",
  ru: "На русском",
};

/**
 * Header language selector — a globe + current language + chevron that opens a
 * dropdown of languages (a green check marks the active one). Picking one
 * switches the whole site's locale (writes the cookie + reloads).
 */
export function LanguageMenu() {
  const { locale, setLocale } = useLocaleSwitch();
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <div ref={rootRef} className="relative flex items-center">
      <Button
        unstyled
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("language")}
        className="text-ink/80 hover:text-ink flex items-center gap-1.5 text-sm font-medium leading-none transition-colors"
      >
        <Globe size={16} />
        {SHORT_LABELS[locale]}
        <Chevron size={15} className="text-ink/50" aria-hidden />
      </Button>

      {open && (
        <div
          role="menu"
          aria-label={t("language")}
          className="glass border-border shadow-lift absolute top-full right-0 z-50 mt-3 w-44 overflow-hidden rounded-2xl border p-1.5"
        >
          {SELECTABLE_LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={l === locale}
              onClick={() => {
                setOpen(false);
                setLocale(l);
              }}
              className="text-ink hover:bg-ink/5 active:bg-ink/10 flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
            >
              {OPTION_LABELS[l]}
              {l === locale && <Check className="text-brand-green h-4 w-4" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
