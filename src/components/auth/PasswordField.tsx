"use client";

import { forwardRef, useState, type ComponentProps } from "react";
import { useTranslations } from "@/i18n/client";
import { Eye, EyeOff } from "lucide-react";
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
  function PasswordField({ label, ...props }, ref) {
    const t = useTranslations("components_auth_PasswordField");
    const [visible, setVisible] = useState(false);

    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        label={label ?? t("label")}
        trailingIcon={
          <Button
            unstyled
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t("hide") : t("show")}
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
