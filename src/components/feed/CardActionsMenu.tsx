"use client";

import type { Ref } from "react";
import { Bookmark, Heart, MoreVertical, Share2 } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { useCardActions } from "./useCardActions";
import type { LibraryEntry } from "@/features/library/useLibrary";

interface CardActionsMenuProps {
  /** Card + book snapshot the menu acts on. */
  entry: LibraryEntry;
  shareUrl?: string;
  shareTitle?: string;
  /** Controlled by the caller — same pattern as the reader's chapter picker,
   * so it can share Escape-to-close and swipe-suppression with it. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Three-dot "more actions" trigger + popover, replacing a persistent
 * Like/Save/Share rail with a single menu: Like, Save and Share collapse into
 * one control instead of three buttons sitting on the card.
 */
export function CardActionsMenu({
  entry,
  shareUrl,
  shareTitle,
  open,
  onOpenChange,
}: CardActionsMenuProps) {
  const t = useTranslations("components_feed_ActionRail");
  const { liked, saved, heartRef, toggleLike, toggleSave, share } = useCardActions(entry, {
    shareUrl,
    shareTitle,
  });

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("actions")}
        className="grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur transition-transform active:scale-90"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {open && (
        <>
          {/* Dismiss on outside tap — decorative only, Escape (wired by the
              caller) is the keyboard/screen-reader path. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            aria-label={t("actions")}
            className="absolute top-full right-0 z-40 mt-2 w-44 overflow-hidden rounded-2xl bg-[#241736]/95 p-1.5 shadow-xl ring-1 ring-white/10 backdrop-blur"
          >
            <MenuItem
              role="menuitemcheckbox"
              ariaChecked={liked}
              iconRef={heartRef}
              icon={<Heart className={cn("h-4 w-4", liked && "fill-current text-red-500")} />}
              label={liked ? t("liked") : t("like")}
              onClick={() => {
                toggleLike();
                onOpenChange(false);
              }}
            />
            <MenuItem
              role="menuitemcheckbox"
              ariaChecked={saved}
              icon={<Bookmark className={cn("h-4 w-4", saved && "fill-current")} />}
              label={saved ? t("saved") : t("save")}
              onClick={() => {
                toggleSave();
                onOpenChange(false);
              }}
            />
            <MenuItem
              role="menuitem"
              icon={<Share2 className="h-4 w-4" />}
              label={t("share")}
              onClick={() => {
                share();
                onOpenChange(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

/** One row of the menu — icon chip + label, matches the chapter picker's rows. */
function MenuItem({
  icon,
  label,
  onClick,
  role,
  ariaChecked,
  iconRef,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  role: "menuitem" | "menuitemcheckbox";
  ariaChecked?: boolean;
  iconRef?: Ref<HTMLSpanElement>;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={role === "menuitemcheckbox" ? ariaChecked : undefined}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-white/10"
    >
      <span
        ref={iconRef}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white/90"
      >
        {icon}
      </span>
      {label}
    </button>
  );
}
