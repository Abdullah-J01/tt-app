"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Share2, Bookmark } from "lucide-react";
import { useLibrary, type LibraryEntry } from "@/features/library/useLibrary";
import { floatHeart, flyHeartToButton } from "./likeEffects";
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

export interface SideActionsHandle {
  /**
   * Instagram-style double-tap like: always likes (never unlikes) and flies a
   * heart from (x, y) into the Like button. Guests are redirected to login.
   */
  likeAt: (x: number, y: number) => void;
}

const SideActions = forwardRef<SideActionsHandle, { card: FeedCardData }>(function SideActions(
  { card },
  ref,
) {
  const router = useRouter();
  const { status } = useSession();
  const { isLiked, isSaved, toggleLiked, toggleSaved } = useLibrary();
  const likeBtnRef = useRef<HTMLButtonElement>(null);

  const liked = isLiked(card.id);
  const saved = isSaved(card.id);

  /**
   * Liking/saving requires a session — send guests to login and back here.
   * While the session is still resolving (first moments after load) the tap
   * is ignored: redirecting a logged-in user to /login would be wrong, and
   * mutating under the anonymous storage key would strand the entry.
   */
  const requireAuth = () => {
    if (status === "authenticated") return true;
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/feed?slug=${card.slug}`)}`);
    }
    return false;
  };

  const withAuth = (action: () => void) => () => {
    if (requireAuth()) action();
  };

  const onLikeClick = () => {
    if (!liked) floatHeart(likeBtnRef.current);
    toggleLiked(toEntry(card));
  };

  useImperativeHandle(
    ref,
    () => ({
      likeAt(x, y) {
        if (!requireAuth()) return;
        if (!liked) toggleLiked(toEntry(card));
        // The heart flies even when already liked — same as Instagram.
        flyHeartToButton(x, y, likeBtnRef.current);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, liked, card, toggleLiked, router],
  );

  return (
    // Mobile/tablet: overlaid inside the card (bottom-right).
    // Desktop (lg+): moved outside the card to its right via left-full + margin.
    <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-4 sm:right-6 sm:bottom-28 lg:top-1/2 lg:right-auto lg:bottom-auto lg:left-full lg:ml-5 lg:-translate-y-1/2">
      <div className="flex flex-col items-center gap-1">
        <motion.button
          ref={likeBtnRef}
          type="button"
          onClick={withAuth(onLikeClick)}
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
        <span className="text-ink/70 text-xs font-medium">Like</span>
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
        <span className="text-ink/70 text-xs font-medium">Share</span>
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
        <span className="text-ink/70 text-xs font-medium">Save</span>
      </div>
    </div>
  );
});

export default SideActions;
