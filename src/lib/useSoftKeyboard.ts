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


export function useSoftKeyboard(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(opensKeyboard(document.activeElement));


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
