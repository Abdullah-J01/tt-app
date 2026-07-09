"use client";

import { useRef, type Ref } from "react";
import { useTranslations } from "@/i18n/client";
import { useAuthGuard } from "@/components/auth/useAuthGuard";
import { Bookmark, Heart, Share2 } from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useLibrary, type LibraryEntry } from "@/features/library/useLibrary";
import { Button } from "@/components/ui/Button";

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

/** Elastic pop on the heart icon when it's liked. */
function popHeart(el: HTMLElement | null) {
  if (!el) return;
  gsap.fromTo(el, { scale: 0.7 }, { scale: 1, duration: 0.55, ease: "elastic.out(1.2, 0.4)" });
}

/**
 * Instagram-style burst: hearts spray out in every direction and fade. Appended
 * to <body> with fixed positioning at the icon's screen coordinates, so they
 * overlay the whole viewport and are never clipped by a card's overflow.
 */
function burstHearts(origin: HTMLElement | null) {
  if (!origin || typeof document === "undefined") return;
  const r = origin.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const N = 14;

  for (let i = 0; i < N; i++) {
    const h = document.createElement("span");
    h.textContent = "♥";
    Object.assign(h.style, {
      position: "fixed",
      left: `${cx}px`,
      top: `${cy}px`,
      color: "#ef4444",
      fontSize: `${gsap.utils.random(12, 24)}px`,
      lineHeight: "1",
      pointerEvents: "none",
      willChange: "transform, opacity",
      zIndex: "9999",
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(h);

    const angle = (Math.PI * 2 * i) / N + gsap.utils.random(-0.25, 0.25);
    const dist = gsap.utils.random(60, 130);
    gsap.fromTo(
      h,
      { xPercent: -50, yPercent: -50, scale: 0, opacity: 1 },
      {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 20, // slight upward drift
        scale: gsap.utils.random(0.7, 1.6),
        rotation: gsap.utils.random(-50, 50),
        opacity: 0,
        duration: gsap.utils.random(0.75, 1.15),
        ease: "power2.out",
        onComplete: () => h.remove(),
      },
    );
  }
}

/**
 * TikTok-style vertical action rail (UI brief §4.1): Save / Like / Share, all in
 * one component. Like & Save persist to localStorage keyed by `id`; Like fires a
 * GSAP heart burst; Share uses the Web Share sheet (clipboard fallback).
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
  const { requireAuth } = useAuthGuard();
  const { isLiked, isSaved, toggleLiked, toggleSaved } = useLibrary();
  const heartRef = useRef<HTMLSpanElement>(null);

  const saved = isSaved(entry.cardId);
  const liked = isLiked(entry.cardId);

  /**
   * Liking/saving requires a session — guests get the login popup instead. Taps
   * while auth is still resolving are ignored (no writes under the anon key).
   */
  const withAuth = (action: () => void) => () => {
    requireAuth(action, t("loginToSave"));
  };

  const toggleLike = () => {
    toggleLiked(entry);
    if (!liked) {
      popHeart(heartRef.current);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduce) burstHearts(heartRef.current);
    }
  };

  const share = async () => {
    const url = shareUrl ?? (typeof window !== "undefined" ? window.location.href : "");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: shareTitle, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* user cancelled / clipboard blocked — ignore */
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 text-white">
      <RailButton
        label={countLabel(saveCount + (saved ? 1 : 0))}
        active={saved}
        onClick={withAuth(() => toggleSaved(entry))}
        icon={<Bookmark className={cn("h-7 w-7", saved && "fill-current")} />}
      />
      <RailButton
        label={countLabel(likeCount + (liked ? 1 : 0))}
        active={liked}
        onClick={withAuth(toggleLike)}
        iconRef={heartRef}
        icon={<Heart className={cn("h-7 w-7", liked && "fill-current text-red-500")} />}
      />
      <RailButton label={t("share")} onClick={share} icon={<Share2 className="h-7 w-7" />} />
      {onOpenBook && (
        <Button
          unstyled
          onClick={onOpenBook}
          aria-label={t("openBook")}
          className="mt-1 h-11 w-11 rounded-full border-2 border-white/80 bg-white/20"
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
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  iconRef?: Ref<HTMLSpanElement>;
}) {
  return (
    <Button unstyled onClick={onClick} className="flex flex-col items-center gap-1">
      <span
        ref={iconRef}
        className={cn(
          "grid h-12 w-12 place-items-center rounded-full bg-black/20 backdrop-blur transition-transform active:scale-90",
          active && "bg-black/30",
        )}
      >
        {icon}
      </span>
      {/* Always reserve the label row so a count appearing/changing (0 → 1)
          doesn't grow the button and shift the rail. */}
      <span className="h-4 text-xs leading-4 font-medium">{label}</span>
    </Button>
  );
}
