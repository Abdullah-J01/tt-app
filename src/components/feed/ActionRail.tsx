"use client";

import { useRef, type Ref } from "react";
import { Bookmark, Heart, Share2 } from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { usePersistedFlag } from "@/lib/usePersistedFlag";
import { Button } from "@/components/ui/Button";
import { toastSaved } from "@/components/ui/Toaster";

interface ActionRailProps {
  /** Stable id for the item (e.g. card id) — keys the persisted like/save state. */
  id: string;
  /** Studybook cover thumbnail (tap → open detail). */
  onOpenBook?: () => void;
  /** Base counts; the current user's tap adds +1 on top (persisted locally). */
  likeCount?: number;
  saveCount?: number;
  /** Optional share target; defaults to the current URL. */
  shareUrl?: string;
  shareTitle?: string;
  /** Extra classes for the count labels — e.g. the feed turns them dark on desktop
   * (`lg:text-ink`) where the rail sits on a white background instead of the card. */
  labelClassName?: string;
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
  id,
  onOpenBook,
  likeCount = 0,
  saveCount = 0,
  shareUrl,
  shareTitle,
  labelClassName,
}: ActionRailProps) {
  const [saved, setSaved] = usePersistedFlag(`tt:save:${id}`);
  const [liked, setLiked] = usePersistedFlag(`tt:like:${id}`);
  const heartRef = useRef<HTMLSpanElement>(null);

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    if (next) toastSaved(() => setSaved(false));
  };

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    if (next) {
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
    <div className="flex flex-col items-center gap-1.5 text-white">
      <RailButton
        label={countLabel(saveCount + (saved ? 1 : 0))}
        labelClassName={labelClassName}
        active={saved}
        onClick={toggleSave}
        icon={<Bookmark className={cn("h-5 w-5", saved && "fill-current")} />}
      />
      <RailButton
        label={countLabel(likeCount + (liked ? 1 : 0))}
        labelClassName={labelClassName}
        active={liked}
        onClick={toggleLike}
        iconRef={heartRef}
        icon={<Heart className={cn("h-5 w-5", liked && "fill-current text-red-500")} />}
      />
      <RailButton
        label="Share"
        labelClassName={labelClassName}
        onClick={share}
        icon={<Share2 className="h-5 w-5" />}
      />
      {onOpenBook && (
        <Button
          unstyled
          onClick={onOpenBook}
          aria-label="Open studybook"
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
  labelClassName,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  iconRef?: Ref<HTMLSpanElement>;
  labelClassName?: string;
}) {
  return (
    <Button unstyled onClick={onClick} className="flex flex-col items-center gap-1">
      <span
        ref={iconRef}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-full bg-black/20 backdrop-blur transition-transform active:scale-90",
          active && "bg-black/30",
        )}
      >
        {icon}
      </span>
      {/* Label slot is always rendered at a fixed height so the row never shifts
          when a count first appears (0 → "1"). */}
      <span className={cn("h-4 text-[11px] leading-4 font-medium tabular-nums", labelClassName)}>
        {label || " "}
      </span>
    </Button>
  );
}
