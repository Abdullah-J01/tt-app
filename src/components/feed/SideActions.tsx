"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Share2, Bookmark } from "lucide-react";
import { useLibrary, type LibraryEntry } from "@/features/library/useLibrary";
import type { FeedCardData } from "./feedData";

const ACTION_BTN =
  "w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white shadow-lift flex items-center justify-center";

function toEntry(card: FeedCardData): LibraryEntry {
  return {
    cardId: card.id,
    cardSlug: card.slug,
    heading: card.title,
    body: card.description,
    bookSlug: card.bookSlug,
    bookTitle: card.bookTitle,
    bookAuthor: card.bookAuthor,
    subject: card.subject,
    grade: card.grade,
    cover: card.cover,
    savedAt: 0, // stamped by the store on insert
  };
}

export default function SideActions({ card }: { card: FeedCardData }) {
  const router = useRouter();
  const { status } = useSession();
  const { isLiked, isSaved, toggleLiked, toggleSaved } = useLibrary();

  const liked = isLiked(card.id);
  const saved = isSaved(card.id);

  /** Liking/saving requires a session — send guests to login and back here. */
  const withAuth = (action: () => void) => () => {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/feed?slug=${card.slug}`)}`);
      return;
    }
    action();
  };

  return (
    // Mobile/tablet: overlaid inside the card (bottom-right).
    // Desktop (lg+): moved outside the card to its right via left-full + margin.
    <div className="absolute z-20 flex flex-col items-center gap-4 right-3 bottom-24 sm:right-4 sm:bottom-28 lg:right-auto lg:bottom-auto lg:left-full lg:top-1/2 lg:ml-5 lg:-translate-y-1/2">
      <div className="flex flex-col items-center gap-1">
        <motion.button
          type="button"
          onClick={withAuth(() => toggleLiked(toEntry(card)))}
          whileTap={{ scale: 0.85 }}
          aria-pressed={liked}
          aria-label="Like"
          className={ACTION_BTN}
        >
          <motion.span
            animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <Heart size={19} className={liked ? "fill-rose-500 text-rose-500" : "text-ink"} />
          </motion.span>
        </motion.button>
        <span className="text-xs font-medium text-ink/70">Like</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          aria-label="Share"
          className={ACTION_BTN}
        >
          <Share2 size={18} className="text-ink" />
        </motion.button>
        <span className="text-xs font-medium text-ink/70">Share</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <motion.button
          type="button"
          onClick={withAuth(() => toggleSaved(toEntry(card)))}
          whileTap={{ scale: 0.85 }}
          aria-pressed={saved}
          aria-label="Save"
          className={ACTION_BTN}
        >
          <Bookmark size={18} className={saved ? "fill-violet text-violet" : "text-ink"} />
        </motion.button>
        <span className="text-xs font-medium text-ink/70">Save</span>
      </div>
    </div>
  );
}
