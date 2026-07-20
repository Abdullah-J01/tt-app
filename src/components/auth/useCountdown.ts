"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Seconds-remaining countdown for the resend cooldown.
 *
 * Ticks against a stored deadline rather than decrementing a counter, so it
 * stays accurate when the tab is backgrounded — browsers throttle timers in
 * inactive tabs, and a naive `n - 1` per interval would drift and let the resend
 * button unlock early (the server would reject it anyway, but the UI would be
 * lying).
 */
export function useCountdown(): {
  secondsLeft: number;
  start: (seconds: number) => void;
  clear: () => void;
} {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const deadlineRef = useRef<number | null>(null);

  const start = useCallback((seconds: number) => {
    deadlineRef.current = Date.now() + seconds * 1000;
    setSecondsLeft(seconds);
  }, []);

  const clear = useCallback(() => {
    deadlineRef.current = null;
    setSecondsLeft(0);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const id = window.setInterval(() => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) deadlineRef.current = null;
    }, 1000);

    return () => window.clearInterval(id);
  }, [secondsLeft]);

  return { secondsLeft, start, clear };
}
