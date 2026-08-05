"use client";

import { useTranslations } from "@/i18n/client";
import { useSubjectName } from "@/i18n/useSubjectName";
import { seedFrom } from "@/lib/synthChapters";

/**
 * Ids from the synthesized Open Library catalog: `ol_<workId>-ch<n>-c<i>`
 * (src/lib/synthChapters.ts). Anything else — TT-authored cards, the offline
 * mock catalog — keeps its stored snapshot text.
 */
const SYNTH_CARD_ID = /^ol_(.+)-ch(\d+)-c(\d+)$/;

/** Keep in step with HEADING_POOL in src/lib/openlibrary.ts (`catalog.bite.h*`). */
const HEADING_POOL = 12;

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
 * the subject (from its slug) and, for synthesized catalog cards, the heading —
 * by replaying the generator's deterministic pick (`seed + chapter*11 + card*3`
 * into the `bite.h*` pool, exactly as synthChapters does) so the Library
 * follows the current language. Real/TT-authored cards and unknown ids fall
 * back to the stored snapshot text, never to a raw message key.
 */
export function useLocalizeEntry() {
  const t = useTranslations("catalog");
  const subjectName = useSubjectName();

  return (entry: LocalizableEntry) => {
    const subject = subjectName(entry.subject, entry.subject);

    const match = SYNTH_CARD_ID.exec(entry.cardId);
    if (match) {
      const [, workId, ch, c] = match;
      // Mirrors synthChapters: 0-based chapter/card indices, same mix formula.
      const n = seedFrom(workId!) + (Number(ch) - 1) * 11 + (Number(c) - 1) * 3;
      const heading = t(`bite.h${(((n % HEADING_POOL) + HEADING_POOL) % HEADING_POOL) + 1}`, {
        title: entry.bookTitle,
        subject,
      });
      return { subject, heading, body: entry.body };
    }

    return { subject, heading: entry.heading, body: entry.body };
  };
}

/** Just the localized subject name for a slug (used where only the badge matters). */
export function useSubjectLabel() {
  const subjectName = useSubjectName();
  return (slug: string) => subjectName(slug, slug);
}
