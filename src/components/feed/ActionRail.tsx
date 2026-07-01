"use client";

import { useState } from "react";
import { Bookmark, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionRailProps {
  /** Studybook cover thumbnail (tap → open detail). */
  onOpenBook?: () => void;
  likeCount?: number;
}

/**
 * TikTok-style vertical action rail (UI brief §4.1).
 * Save / Like / Share. State is local placeholder — wire to API + auth.
 */
export function ActionRail({ onOpenBook, likeCount = 0 }: ActionRailProps) {
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex flex-col items-center gap-5 text-white">
      <RailButton
        label="Save"
        active={saved}
        onClick={() => setSaved((v) => !v)}
        icon={<Bookmark className={cn("h-7 w-7", saved && "fill-current")} />}
      />
      <RailButton
        label={String(likeCount + (liked ? 1 : 0))}
        active={liked}
        onClick={() => setLiked((v) => !v)}
        icon={<Heart className={cn("h-7 w-7", liked && "fill-current text-amber")} />}
      />
      <RailButton
        label="Share"
        icon={<Share2 className="h-7 w-7" />}
        onClick={() => {
          // TODO: open share sheet / copy link
        }}
      />
      {onOpenBook && (
        <button
          onClick={onOpenBook}
          aria-label="Open studybook"
          className="mt-1 h-11 w-11 rounded-full border-2 border-white/80 bg-white/20"
        />
      )}
    </div>
  );
}

function RailButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "grid h-12 w-12 place-items-center rounded-full bg-black/20 backdrop-blur transition-transform active:scale-90",
          active && "bg-black/30",
        )}
      >
        {icon}
      </span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
