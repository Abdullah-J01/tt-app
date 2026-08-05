"use client";

import Link from "@/i18n/Link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pill } from "@/components/ui/Pill";
import { useSubjectLabel } from "@/features/library/useLocalizedEntry";
import type { LibraryEntry } from "@/features/library/useLibrary";
import { subjectGradient } from "./subjectGradient";

const easeOut = [0.22, 1, 0.36, 1] as const;

/** What a Studybooks-tab tile needs — satisfied by both BookEntry and LibraryEntry. */
export type LibraryBook = Pick<LibraryEntry, "bookSlug" | "bookTitle" | "bookAuthor" | "subject"> & {
  /** Optional — falls back to a subject-colored cover when absent. */
  coverImage?: string;
};

/**
 * A studybook rendered as an actual book cover: flat spine on the left,
 * a couple of stacked "pages" behind it for depth, subtle 3D tilt on hover.
 */
export function BookTile({ book }: { book: LibraryBook }) {
  const subjectLabel = useSubjectLabel();
  return (
    <Link href={`/studybook/${book.bookSlug}`} className="group block [perspective:900px]">
      <motion.div
        whileHover={{ rotateY: -8, y: -4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.25, ease: easeOut }}
        style={{ transformStyle: "preserve-3d" }}
        // aspect-[3/4] matches FeedCardTile, so a book tile and a card tile
        // occupy the same footprint across the two tabs.
        className="relative aspect-[3/4]"
      >
        {/* stacked pages behind the cover, for physical depth */}
        <div className="bg-ink/10 absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-l-[3px] rounded-r-lg" />
        <div className="bg-ink/15 absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-l-[3px] rounded-r-lg" />

        {/* cover */}
        <div
          className={cn(
            "relative h-full w-full overflow-hidden rounded-l-[3px] rounded-r-lg bg-gradient-to-br shadow-lg ring-1 ring-black/10",
            subjectGradient(book.subject),
          )}
        >
          {book.coverImage ? (
            <Image src={book.coverImage} alt="" fill sizes="200px" className="object-cover" />
          ) : (
            <BookOpen className="absolute -right-4 -bottom-4 h-28 w-28 text-white/10" aria-hidden />
          )}

          {/* spine */}
          <div className="absolute inset-y-0 left-0 w-[10px] bg-gradient-to-r from-black/35 to-transparent" />
          <div className="absolute inset-y-1.5 left-[3px] w-px bg-white/10" />

          <div className="absolute top-3 right-2.5 left-4">
            <Pill className="bg-white/20 text-white">{subjectLabel(book.subject)}</Pill>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent px-4 pt-8 pb-3 pl-5">
            <p className="line-clamp-2 text-sm leading-snug font-semibold text-white">
              {book.bookTitle}
            </p>
            <p className="mt-0.5 truncate text-xs text-white/65">{book.bookAuthor}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
