"use client";

import { useTranslations } from "@/i18n/client";
import { useSubjectName } from "@/i18n/useSubjectName";

/** cardId suffix (…-c1/-c2/-c3) → the synthesized card's template keys. */
const CARD_KINDS: Record<string, { heading: string; body: string }> = {
  c1: { heading: "card.bigIdeaHeading", body: "card.bigIdeaBody" },
  c2: { heading: "card.rememberHeading", body: "card.rememberBody" },
  c3: { heading: "card.mattersHeading", body: "card.mattersBody" },
};

interface LocalizableEntry {
  cardId: string;
  heading: string;
  body: string;
  subject: string;
  bookTitle: string;
}

/**
 * Re-derives a saved entry's display text in the active locale. Saved cards are
 * snapshotted with whatever language was active when saved; this re-translates
 * the subject (from its slug) and the synthesized heading/body (from the card
 * kind + book title) so the Library follows the current language. Real book
 * titles/authors stay as-is. Falls back to the stored text for unknown cards.
 */
export function useLocalizeEntry() {
  const t = useTranslations("catalog");
  const subjectName = useSubjectName();

  return (entry: LocalizableEntry) => {
    const subject = subjectName(entry.subject, entry.subject);
    const suffix = entry.cardId.split("-").pop() ?? "";
    const kind = CARD_KINDS[suffix];
    if (kind) {
      return {
        subject,
        heading: t(kind.heading, { title: entry.bookTitle }),
        body: t(kind.body, { subject, title: entry.bookTitle }),
      };
    }
    return { subject, heading: entry.heading, body: entry.body };
  };
}

/** Just the localized subject name for a slug (used where only the badge matters). */
export function useSubjectLabel() {
  const subjectName = useSubjectName();
  return (slug: string) => subjectName(slug, slug);
}
