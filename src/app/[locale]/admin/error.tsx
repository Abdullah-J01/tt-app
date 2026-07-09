"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

/** Error boundary for the admin section — keeps the shell up and offers a retry. */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("app_admin_error");

  return (
    <Card>
      <EmptyState
        icon={<AlertTriangle />}
        title={t("title")}
        description={t("description")}
        action={
          <Button size="sm" onClick={reset}>
            {t("tryAgain")}
          </Button>
        }
      />
    </Card>
  );
}
