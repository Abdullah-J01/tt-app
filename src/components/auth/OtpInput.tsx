"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { OTP_LENGTH } from "@/lib/authRules";

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  invalid = false,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Fired when the last box fills — lets the parent auto-submit. */
  onComplete?: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  ariaLabel: string;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  const focusBox = (index: number) => {
    const clamped = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    refs.current[clamped]?.focus();
    refs.current[clamped]?.select();
  };

  const commit = (next: string) => {
    onChange(next);
    if (next.length === OTP_LENGTH) onComplete?.(next);
  };

  const handleInput = (index: number, raw: string) => {
    // Strip non-digits first: an Android keyboard can deliver a whole autofilled
    // code into a single box, and pasting often arrives the same way.
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) return;

    if (cleaned.length > 1) {
      // Multi-character delivery — spread it from this box onward.
      const merged = (value.slice(0, index) + cleaned).slice(0, OTP_LENGTH);
      commit(merged);
      focusBox(merged.length);
      return;
    }

    // Replace this position, keeping everything after it intact.
    const merged = (value.slice(0, index) + cleaned + value.slice(index + 1)).slice(0, OTP_LENGTH);
    commit(merged);
    if (index < OTP_LENGTH - 1) focusBox(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (value[index]) {
        // Delete this digit and pull the rest left — the same thing backspace
        // does in a plain text field, which is what these boxes really are.
        onChange(value.slice(0, index) + value.slice(index + 1));
        return;
      }
      // Already empty — step back and delete the previous digit.
      if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index));
        focusBox(index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    commit(pasted);
    focusBox(pasted.length);
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center justify-center gap-2 sm:gap-2.5"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          // Only the first box advertises the code, or every box competes for
          // the same autofill suggestion.
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={OTP_LENGTH}
          value={digit}
          disabled={disabled}
          aria-label={`${ariaLabel} ${index + 1}`}
          aria-invalid={invalid || undefined}
          onChange={(event) => handleInput(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className={cn(
            "border-violet/15 bg-lavender/50 text-ink h-13 w-full min-w-0 rounded-xl border-[1.5px]",
            "text-center text-xl font-semibold backdrop-blur-sm outline-none",
            "focus:border-violet focus:ring-lavender transition-shadow focus:ring-2",
            "disabled:opacity-60",
            invalid && "border-danger focus:border-danger focus:ring-danger-tint",
          )}
        />
      ))}
    </div>
  );
}
