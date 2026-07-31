const KEY = "tt:lastTab";

/**
 * Bottom-nav tab the user was on right before opening the immersive feed
 * (`FeedScreen`'s back arrow reads this instead of `router.back()` — swiping
 * through feed cards pushes one history entry per card, so a plain back()
 * just steps back through those instead of leaving the feed). `sessionStorage`
 * because this is only meaningful for the current visit, not a lasting
 * preference.
 */
export function setLastTab(path: string) {
  try {
    window.sessionStorage.setItem(KEY, path);
  } catch {
    /* storage unavailable (private mode) — feed back falls back to /explore */
  }
}

export function getLastTab(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
