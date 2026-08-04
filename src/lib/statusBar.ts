"use client";

import { useEffect } from "react";

/**
 * Keeps the safe-area background and browser/PWA theme color in sync.
 * Defaults to white; only immersive screens override it with their own color.
 */
export const DEFAULT_STATUS_BAR = "#ffffff";

export function useStatusBarColor(color: string, active = true) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.style.setProperty("--status-bar-bg", color);
    const resolved = getComputedStyle(root).getPropertyValue("--status-bar-bg").trim();
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previous = meta?.content;
    if (meta && resolved) meta.content = resolved;
    return () => {
      root.style.removeProperty("--status-bar-bg");
      if (meta) meta.content = previous || DEFAULT_STATUS_BAR;
    };
  }, [color, active]);
}
