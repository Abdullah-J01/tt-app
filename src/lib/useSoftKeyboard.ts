"use client";

import { useEffect, useState } from "react";

/** Input types that never raise the on-screen keyboard. */
const NON_TEXT_INPUTS = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

function opensKeyboard(node: Element | null): boolean {
  if (!(node instanceof HTMLElement)) return false;
  if (node.isContentEditable) return true;
  if (node instanceof HTMLTextAreaElement) return !node.readOnly && !node.disabled;
  if (node instanceof HTMLInputElement) {
    return !NON_TEXT_INPUTS.has(node.type) && !node.readOnly && !node.disabled;
  }
  return false;
}

/**
 * True while a text field holds focus — i.e. while the soft keyboard is up.
 *
 * Deliberately focus-based rather than viewport-measuring. Android shrinks the
 * *layout* viewport when the keyboard opens (Chrome's standalone/PWA activity
 * runs with `adjustResize`), so `visualViewport.height` and `innerHeight` shrink
 * together and the usual "visual viewport is shorter than the layout viewport"
 * probe reports nothing. Focus is the one signal that reads the same on both
 * platforms, and it needs no height thresholds to guess at.
 *
 * Used to stand fixed bottom chrome down while typing — see `MobileNav`. Without
 * it, `bottom: 0` re-anchors to the shrunken layout viewport and the bar climbs
 * up over the page content instead of staying put under the keyboard.
 */
export function useSoftKeyboard(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(opensKeyboard(document.activeElement));

    // focusout fires *before* the next focusin, so reading activeElement
    // synchronously reports `body` mid-hop and flashes the chrome back in
    // between two fields. Re-read on the next frame instead.
    const onFocusOut = () => requestAnimationFrame(sync);

    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", onFocusOut);
    sync();

    return () => {
      document.removeEventListener("focusin", sync);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return open;
}
