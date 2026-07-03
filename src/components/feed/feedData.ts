/** URL-safe slug for a card heading — the basis of `/feed?slug=` deep-links. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export type FeedCardData = {
  id: string;
  /** Unique, URL-safe slug for this card — used as the `?slug=` deep-link. */
  slug: string;
  streakDays: number;
  subject: string;
  grade: string;
  title: string;
  description: string;
  bookTitle: string;
  bookAuthor: string;
  bookSubject: string;
  /** Studybook slug — lets saved cards link back to /studybook/[slug]. */
  bookSlug: string;
  likes: string;
  shares: string;
};
