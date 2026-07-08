"use client";

import { useState } from "react";
import Link from "@/i18n/Link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/client";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldError } from "@/components/ui/FieldError";
import { Form, useZodForm } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { GRADES, SUBJECTS } from "@/config/subjects";
import type { Studybook } from "@/types";
import { createStudybook, updateStudybook } from "../actions";
import { studybookSchema } from "../schemas";

interface StudybookFormProps {
  /** When present the form edits this studybook; otherwise it creates a new one. */
  book?: Studybook;
}

/** Create/edit form for a studybook's metadata. Cards are managed by `CardEditor`. */
export function StudybookForm({ book }: StudybookFormProps) {
  const t = useTranslations("features_admin_components_StudybookForm");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useZodForm(studybookSchema, {
    defaultValues: book
      ? {
          title: book.title,
          author: book.author,
          year: book.year,
          subjectSlug: book.subjectSlug,
          grade: book.grade,
          category: book.category,
          synopsis: book.synopsis,
          cover: book.cover ?? "",
          priceEur: book.priceEur ?? "",
        }
      : { subjectSlug: "", grade: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = async (values: unknown) => {
    setServerError(null);
    setSaved(false);
    const result = book ? await updateStudybook(book.slug, values) : await createStudybook(values);
    if (!result.ok) {
      setServerError(result.error ?? t("genericError"));
      return;
    }
    if (book) {
      setSaved(true);
      router.refresh();
    } else {
      router.push(`/admin/studybooks/${result.slug}`);
      router.refresh();
    }
  };

  return (
    <Card className="p-6">
      <Form form={form} onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label={t("titleLabel")}
          requiredMark
          placeholder={t("titlePlaceholder")}
          error={errors.title?.message}
          {...form.register("title")}
        />
        <Input
          label={t("authorLabel")}
          requiredMark
          placeholder={t("authorPlaceholder")}
          error={errors.author?.message}
          {...form.register("author")}
        />
        <Input
          label={t("yearLabel")}
          requiredMark
          type="number"
          inputMode="numeric"
          placeholder="2026"
          error={errors.year?.message}
          {...form.register("year")}
        />
        <Input
          label={t("categoryLabel")}
          requiredMark
          placeholder={t("categoryPlaceholder")}
          error={errors.category?.message}
          {...form.register("category")}
        />
        <Select
          label={t("subjectLabel")}
          requiredMark
          error={errors.subjectSlug?.message}
          {...form.register("subjectSlug")}
        >
          <option value="" disabled>
            {t("subjectPlaceholder")}
          </option>
          {SUBJECTS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select label={t("gradeLabel")} requiredMark error={errors.grade?.message} {...form.register("grade")}>
          <option value="" disabled>
            {t("gradePlaceholder")}
          </option>
          {GRADES.filter((g) => g.slug !== "all").map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </Select>
        <Input
          label={t("coverLabel")}
          type="url"
          placeholder="https://…"
          hint={t("coverHint")}
          error={errors.cover?.message}
          {...form.register("cover")}
        />
        <Input
          label={t("priceLabel")}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          hint={t("priceHint")}
          error={errors.priceEur?.message}
          {...form.register("priceEur")}
        />
        <div className="md:col-span-2">
          <Textarea
            label={t("synopsisLabel")}
            requiredMark
            rows={4}
            placeholder={t("synopsisPlaceholder")}
            error={errors.synopsis?.message}
            {...form.register("synopsis")}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <Button type="submit" loading={isSubmitting}>
            {book ? t("saveChanges") : t("createStudybook")}
          </Button>
          <Link
            href="/admin/studybooks"
            className="text-muted hover:text-ink rounded-lg px-2 py-1 text-sm font-medium transition-colors"
          >
            {t("backToStudybooks")}
          </Link>
          <span aria-live="polite" className="flex items-center gap-1.5">
            {saved && (
              <>
                <Check className="text-green-dark h-4 w-4" aria-hidden />
                <span className="text-green-dark text-sm font-medium">{t("saved")}</span>
              </>
            )}
          </span>
          <FieldError>{serverError}</FieldError>
        </div>
      </Form>
    </Card>
  );
}
