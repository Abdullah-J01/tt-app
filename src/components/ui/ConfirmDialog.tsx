"use client";

import { useEffect } from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Extra context under the title (e.g. what will be lost). */
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm CTA with the danger token — use for deletes. */
  destructive?: boolean;
  /** Disables dismissal and spins the confirm CTA while the action runs. */
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Small centered confirmation dialog (same overlay pattern as FilterDrawer):
 * locks page scroll, closes on overlay click or Escape, traps the decision
 * behind an explicit button press.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const dismiss = () => {
    if (!loading) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="fade-in absolute inset-0 bg-black/40" onClick={dismiss} />
      <div className="anim-pop bg-surface rounded-card shadow-lift relative w-full max-w-sm p-6">
        <h2 className="text-ink font-display text-lg font-bold">{title}</h2>
        {description && <p className="text-muted mt-2 text-sm">{description}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={dismiss} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
