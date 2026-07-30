"use client";

import { useRef } from "react";
import { useTranslations } from "@/i18n/client";
import { useAuthGuard } from "@/components/auth/useAuthGuard";
import gsap from "gsap";
import { useLibrary, type LibraryEntry } from "@/features/library/useLibrary";

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
 * Shared Like/Save/Share behavior for one card entry: auth-gated toggles (guests
 * get the login popup instead of writing to the anon key), the heart-burst
 * animation, and the Web Share sheet (clipboard fallback). Used by both the
 * feed's persistent rail (`ActionRail`) and the reader's actions menu
 * (`CardActionsMenu`) so the gesture/animation/auth logic lives in one place.
 */
export function useCardActions(
  entry: LibraryEntry,
  options: { shareUrl?: string; shareTitle?: string } = {},
) {
  const t = useTranslations("components_feed_ActionRail");
  const { requireAuth } = useAuthGuard();
  const { isLiked, isSaved, toggleLiked, toggleSaved } = useLibrary();
  const heartRef = useRef<HTMLSpanElement>(null);

  const liked = isLiked(entry.cardId);
  const saved = isSaved(entry.cardId);

  const toggleLike = () => {
    requireAuth(() => {
      toggleLiked(entry);
      if (!liked) {
        popHeart(heartRef.current);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduce) burstHearts(heartRef.current);
      }
    }, t("loginToSave"));
  };

  const toggleSave = () => {
    requireAuth(() => toggleSaved(entry), t("loginToSave"));
  };

  const share = async () => {
    const url = options.shareUrl ?? (typeof window !== "undefined" ? window.location.href : "");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: options.shareTitle, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* user cancelled / clipboard blocked — ignore */
    }
  };

  return { liked, saved, heartRef, toggleLike, toggleSave, share };
}
