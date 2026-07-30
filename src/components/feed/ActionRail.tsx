"use client";

import type { Ref } from "react";
import { Bookmark, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useCardActions } from "./useCardActions";
import type { LibraryEntry } from "@/features/library/useLibrary";
import { useTranslations } from "@/i18n/client";

interface ActionRailProps {
  /** Card + book snapshot — persisted to the library on like/save. */
  entry: LibraryEntry;
  /** Studybook cover thumbnail (tap → open detail). */
  onOpenBook?: () => void;
  /** Base counts; the current user's tap adds +1 on top (persisted locally). */
  likeCount?: number;
  saveCount?: number;
  /** Optional share target; defaults to the current URL. */
  shareUrl?: string;
  shareTitle?: string;
}

/** Compact count label, hidden at zero: 0 → "", 988 → "988", 2700 → "2.7k". */
function countLabel(n: number) {
  if (n <= 0) return "";
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 10 ? Math.round(k) : Number(k.toFixed(1))}k`;
}

/**
 * TikTok-style vertical action rail (UI brief §4.1): Save / Like / Share, all in
 * one component. Like/Save/Share/auth behavior lives in `useCardActions`
 * (shared with the reader's actions menu) — this component is just the rail
 * chrome around it.
 */
export function ActionRail({
  entry,
  onOpenBook,
  likeCount = 0,
  saveCount = 0,
  shareUrl,
  shareTitle,
}: ActionRailProps) {
  const t = useTranslations("components_feed_ActionRail");
  const { liked, saved, heartRef, toggleLike, toggleSave, share } = useCardActions(entry, {
    shareUrl,
    shareTitle,
  });

  return (
    <div className="flex flex-col items-center gap-4 text-white">
      <RailButton
        label={countLabel(saveCount + (saved ? 1 : 0))}
        active={saved}
        onClick={toggleSave}
        icon={<Bookmark className={cn("h-5 w-5", saved && "fill-current")} />}
      />
      <RailButton
        label={countLabel(likeCount + (liked ? 1 : 0))}
        active={liked}
        onClick={toggleLike}
        iconRef={heartRef}
        icon={<Heart className={cn("h-5 w-5", liked && "fill-current text-red-500")} />}
      />
      <RailButton /* label={t("share")} */ onClick={share} icon={<Share2 className="h-5 w-5" />} />
      {onOpenBook && (
        <Button
          unstyled
          onClick={onOpenBook}
          aria-label={t("openBook")}
          className="mt-1 h-9 w-9 rounded-full border-2 border-white/80 bg-white/20"
        />
      )}
    </div>
  );
}

/** Circular icon button with a label below — the building block of the rail. */
function RailButton({
  label,
  icon,
  active,
  onClick,
  iconRef,
}: {
  label?: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  iconRef?: Ref<HTMLSpanElement>;
}) {
  return (
    <Button unstyled onClick={onClick} className="relative flex flex-col items-center">
      <span
        ref={iconRef}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-full bg-black/20 backdrop-blur transition-transform active:scale-90",
          active && "bg-black/30",
        )}
      >
        {icon}
      </span>
      {/* Label floats in the flex gap below the circle (absolute, zero layout
          height) so a count appearing/changing (0 → 1) never resizes the rail. */}
      {label && (
        <span className="pointer-events-none absolute top-full left-1/2 h-4 -translate-x-1/2 text-[11px] leading-4 font-medium whitespace-nowrap">
          {label}
        </span>
      )}
    </Button>
  );
}
