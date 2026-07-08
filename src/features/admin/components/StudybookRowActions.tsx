"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/client";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteStudybook } from "../actions";

interface StudybookRowActionsProps {
  slug: string;
  title: string;
}

/** Edit link + guarded delete for a studybook table row. */
export function StudybookRowActions({ slug, title }: StudybookRowActionsProps) {
  const t = useTranslations("features_admin_components_StudybookRowActions");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onConfirm = () =>
    startTransition(async () => {
      const result = await deleteStudybook(slug);
      if (!result.ok) {
        setError(result.error ?? t("genericError"));
        return;
      }
      setConfirming(false);
      router.refresh();
    });

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/studybooks/${slug}`}
        aria-label={t("editAria", { title })}
        className="text-muted hover:bg-lavender hover:text-violet grid h-8 w-8 place-items-center rounded-lg transition-colors"
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </Link>
      <Button
        unstyled
        type="button"
        aria-label={t("deleteAria", { title })}
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
        className="text-muted hover:bg-danger-tint hover:text-danger grid h-8 w-8 place-items-center rounded-lg transition-colors"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </Button>

      <ConfirmDialog
        open={confirming}
        title={t("confirmTitle", { title })}
        description={error ?? t("confirmDescription")}
        confirmLabel={t("confirmLabel")}
        destructive
        loading={pending}
        onConfirm={onConfirm}
        onClose={() => setConfirming(false)}
      />
    </div>
  );
}
