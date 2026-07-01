import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name for the switch (used as `aria-label`). */
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Switch control (daily reminder, settings). Real `role="switch"` with `aria-checked`. */
export function Toggle({ checked, onChange, label, disabled = false, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/40",
        checked ? "bg-violet" : "bg-hairline",
        disabled && "opacity-50",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}
