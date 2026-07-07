import type { FeedItem } from "@/lib/api";

/** URL-safe slug for a card heading — the basis of `/feed/[slug]` deep-links. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Canonical path for a card's deep-link. */
export function feedPath(slug: string): string {
  return `/feed/${slug}`;
}

export type FeedCardData = {
  id: string;
  /** Unique, URL-safe slug for this card — used as the `/feed/[slug]` deep-link. */
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
  /** Studybook cover art (same source as the Explore cards). */
  cover?: string;
  likes: string;
  shares: string;
};

function toCardData({ card, book }: FeedItem, slug: string): FeedCardData {
  return {
    id: card.id,
    slug,
    streakDays: 7,
    subject: book.subjectSlug,
    grade: book.grade,
    title: card.heading,
    description: card.body,
    bookTitle: book.title,
    bookAuthor: book.author,
    bookSubject: book.subjectSlug,
    bookSlug: book.slug,
    cover: book.cover,
    likes: "",
    shares: "",
  };
}

/**
 * Map feed items to cards, giving each a unique, readable slug. Headings can
 * repeat across studybooks (e.g. "Why it matters"), so collisions get a numeric
 * suffix — keeping every card's `/feed/[slug]` deep-link unique. Shared by the
 * client feed and the server route's `generateMetadata`, so both resolve the
 * same slugs.
 */
export function withSlugs(items: FeedItem[]): FeedCardData[] {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const base = slugify(item.card.heading) || item.card.id;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return toCardData(item, n === 1 ? base : `${base}-${n}`);
  });
}
