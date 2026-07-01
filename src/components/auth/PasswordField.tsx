"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";

type PasswordFieldProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "leadingIcon" | "trailingIcon"
>;

/**
 * Password field = the stateless `Input` primitive + a caller-owned visibility
 * toggle. Keeps the toggle state here so `Input` itself stays server-safe.
 */
export function PasswordField({ label = "Password", ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      type={visible ? "text" : "password"}
      label={label}
      leadingIcon={<Lock />}
      trailingIcon={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="flex items-center text-muted hover:text-ink [&_svg]:h-5 [&_svg]:w-5"
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      }
      {...props}
    />
  );
}
