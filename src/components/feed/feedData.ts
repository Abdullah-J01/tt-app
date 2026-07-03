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
  /** Studybook slug — links the card to its detail page (/studybook/[slug]). */
  bookSlug: string;
  /** Studybook cover art (same source as the Explore cards). */
  cover?: string;
  likes: string;
  shares: string;
};
