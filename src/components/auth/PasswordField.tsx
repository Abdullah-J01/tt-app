"use client";

import { forwardRef, useState, type ComponentProps } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type PasswordFieldProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "leadingIcon" | "trailingIcon"
>;

/**
 * Password field = the stateless `Input` primitive + a caller-owned visibility
 * toggle, with a reusable show/hide eye button. Keeps the toggle state here so
 * `Input` itself stays server-safe. Forwards its ref, so `{...register("password")}`
 * works directly with React Hook Form.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ label = "Password", ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        label={label}
        leadingIcon={<Lock />}
        trailingIcon={
          <Button
            unstyled
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="text-muted hover:text-ink flex items-center [&_svg]:h-5 [&_svg]:w-5"
          >
            {visible ? <EyeOff /> : <Eye />}
          </Button>
        }
        {...props}
      />
    );
  },
);
