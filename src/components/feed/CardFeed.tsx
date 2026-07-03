import { StudyCard } from "./StudyCard";
import { slugify } from "./feedData";
import type { LibraryEntry } from "@/features/library/useLibrary";
import type { Studybook, StudyCard as StudyCardType } from "@/types";

export interface FeedItem {
  card: StudyCardType;
  book: Studybook;
  index: number;
  total: number;
}

/** Library snapshot for a card — lets the rail's like/save persist. */
function toEntry(card: StudyCardType, book: Studybook): LibraryEntry {
  return {
    cardId: card.id,
    cardSlug: slugify(card.heading) || card.id,
    heading: card.heading,
    body: card.body,
    bookSlug: book.slug,
    bookTitle: book.title,
    bookAuthor: book.author,
    subject: book.subjectSlug,
    grade: book.grade,
    savedAt: 0, // stamped by the store on insert
  };
}

/**
 * Vertical, snapping feed of immersive cards (UI brief §4).
 * Works for both the "For You" feed and a single-studybook reader.
 *
 * TODO(team): add an IntersectionObserver to track the active card for
 * analytics, progress saving, and prefetching the next studybook.
 */
export function CardFeed({ items }: { items: FeedItem[] }) {
  return (
    <div className="snap-feed h-[100svh] w-full">
      {items.map(({ card, book, index, total }) => (
        <StudyCard
          key={card.id}
          entry={toEntry(card, book)}
          heading={card.heading}
          body={card.body}
          subjectLabel={book.category}
          bookTitle={book.title}
          author={book.author}
          index={index}
          total={total}
        />
      ))}
    </div>
  );
}
