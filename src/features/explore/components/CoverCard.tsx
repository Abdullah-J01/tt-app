import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bookmark, BookOpen, Zap } from "lucide-react";
import { SUBJECTS } from "@/config/subjects";
import type { Studybook } from "@/types";

function subjectName(slug: string) {
  return SUBJECTS.find((s) => s.slug === slug)?.name ?? slug;
}

/**
 * Rich studybook card with a 3D flip on hover: the front shows the big title +
 * meta + price; the back reveals the cover with footer meta and an open prompt.
 * Reused across Explore rows, subject grids and search.
 */
export function CoverCard({ book }: { book: Studybook }) {
  const cards = book.cards.length;
  const minutes = Math.max(1, Math.round(cards * 0.5));
  const subject = subjectName(book.subjectSlug);
  const price = book.priceEur != null ? `€${book.priceEur.toFixed(2)}` : "Free";

  return (
    <Link href={`/studybook/${book.slug}`} className="group block aspect-[7/10] [perspective:1200px]">
      <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* ── Back (hover): cover + footer meta + open prompt ── */}
        <div className="bg-plum absolute inset-0 flex flex-col overflow-hidden rounded-2xl text-white shadow-soft [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {/* Cover area */}
          <div className="relative flex-1">
            {book.cover && (
              <Image
                src={book.cover}
                alt={book.title}
                fill
                sizes="(max-width: 768px) 50vw, 240px"
                className="object-cover"
              />
            )}
            {/* Subtle texture only when there's no real cover */}
            {!book.cover ? (
              <div
                aria-hidden
                className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.07)_0,rgba(255,255,255,0.07)_1px,transparent_1px,transparent_11px)]"
              />
            ) : (
              // Faint top/bottom shading so the pill and edges stay legible; the book stays visible.
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20"
              />
            )}
            {!book.cover && (
              <span className="absolute inset-0 grid place-items-center font-mono text-xs tracking-[0.3em] text-white/40">
                book cover
              </span>
            )}

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur">
                <Zap className="h-3 w-3 text-amber" />
                <span className="truncate">{subject}</span>
              </span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/30 backdrop-blur">
                <Bookmark className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-black/35 p-3 sm:p-4">
            <p className="line-clamp-1 text-sm font-bold leading-snug sm:text-base">{book.title}</p>
            <p className="line-clamp-1 text-xs text-white/70 sm:text-sm">{book.author}</p>
            <div className="mt-2 flex items-center justify-between gap-1.5 text-[11px] text-white/70 sm:mt-3 sm:gap-2">
              <span className="flex min-w-0 items-center gap-1 sm:gap-1.5">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate whitespace-nowrap">
                  {cards} cards
                  <span className="hidden sm:inline">
                    {" "}
                    <span className="text-white/40">·</span> ~ {minutes} min
                  </span>
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-white">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* ── Front (default): cover image + name + price ── */}
        <div className="bg-plum absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-soft [backface-visibility:hidden]">
          {book.cover ? (
            <Image src={book.cover} alt={book.title} fill sizes="240px" className="object-cover" />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.06)_0,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_11px)]"
            />
          )}
          {/* Darken so the name reads over any cover */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />

          <div className="relative">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur">
              <Zap className="h-3 w-3 text-amber" />
              {subject}
            </span>
          </div>

          <div className="relative">
            <h3 className="line-clamp-3 text-xl font-bold leading-tight text-white">{book.title}</h3>
            <p className="mt-1 line-clamp-1 text-sm text-white/80">{book.author}</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-white/70">
                {cards} cards · ~ {minutes} min
              </span>
              <span className="font-bold uppercase tracking-wide text-white">{price}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
