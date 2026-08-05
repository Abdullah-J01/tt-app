"use client";

import { useTranslations } from "@/i18n/client";
import Link from "@/i18n/Link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bookmark, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { feedPath } from "@/components/feed/feedData";
import { useLocalizeEntry } from "@/features/library/useLocalizedEntry";
import type { LibraryEntry } from "@/features/library/useLibrary";
import { subjectGradient } from "./subjectGradient";

const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * A saved/liked entry rendered as a miniature replica of the actual feed card —
 * gradient background, glass badge, headline — so Library feels continuous with the feed.
 */
export function FeedCardTile({
  entry,
  liked,
  onRemove,
}: {
  entry: LibraryEntry;
  liked: boolean;
  onRemove: () => void;
}) {
  const t = useTranslations("app_app_library_page");
  const localize = useLocalizeEntry();
  const loc = localize(entry);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: easeOut }}
      className={cn(
        "group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br shadow-md ring-1 ring-black/5",
        subjectGradient(entry.subject),
      )}
    >
      {/* real card artwork when present, with a dark scrim so text stays legible */}
      {entry.cover && (
        <>
          <Image
            src={entry.cover}
            alt=""
            fill
            sizes="(min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        </>
      )}

      {/* ambient glow blob for depth, matches feed card treatment */}
      <div className="pointer-events-none absolute -top-8 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

      <Link href={feedPath(entry.cardSlug)} className="relative flex h-full flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
            {loc.subject}
          </span>
          {liked && (
            <Button
              unstyled
              type="button"
              onClick={onRemove}
              aria-label={t("removeAria", { heading: entry.heading })}
              className="absolute top-4 right-2 flex h-8 w-8 items-center justify-center"
            >
              <Heart className="h-3.5 w-3.5 shrink-0 fill-white/80 text-white/80" />{" "}
            </Button>
          )}
        </div>

        <p className="mt-2.5 line-clamp-4 flex-1 text-sm leading-snug font-semibold text-white">
          {loc.heading}
        </p>

        <div className="mt-2 border-t border-white/15 pt-2">
          <p className="truncate text-[11px] font-medium text-white/70">{entry.bookTitle}</p>
          <p className="truncate text-[10px] text-white/45">{entry.bookAuthor}</p>
        </div>
      </Link>

      {!liked && (
        <Button
          unstyled
          type="button"
          onClick={onRemove}
          aria-label={t("removeAria", { heading: entry.heading })}
          className="absolute top-4 right-2 flex h-8 w-8 items-center justify-center"
        >
          <Bookmark className="h-4 w-4 fill-white text-white md:h-6 md:w-6" fill="currentColor" />
        </Button>
      )}
    </motion.div>
  );
}
