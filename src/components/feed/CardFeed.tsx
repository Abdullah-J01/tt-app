import { StudyCard } from "./StudyCard";
import type { Studybook, StudyCard as StudyCardType } from "@/types";

export interface FeedItem {
  card: StudyCardType;
  book: Studybook;
  index: number;
  total: number;
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
