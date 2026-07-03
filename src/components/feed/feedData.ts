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
  likes: string;
  shares: string;
};
