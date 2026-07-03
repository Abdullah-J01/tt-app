"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
      setServerError(result.error ?? "Something went wrong — try again.");
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
          label="Title"
          requiredMark
          placeholder="e.g. A Very Serious Snowman Story"
          error={errors.title?.message}
          {...form.register("title")}
        />
        <Input
          label="Author"
          requiredMark
          placeholder="e.g. Johanna Unt"
          error={errors.author?.message}
          {...form.register("author")}
        />
        <Input
          label="Year"
          requiredMark
          type="number"
          inputMode="numeric"
          placeholder="2026"
          error={errors.year?.message}
          {...form.register("year")}
        />
        <Input
          label="Category"
          requiredMark
          placeholder="e.g. Textbook, Novel, Study guide"
          error={errors.category?.message}
          {...form.register("category")}
        />
        <Select
          label="Subject"
          requiredMark
          error={errors.subjectSlug?.message}
          {...form.register("subjectSlug")}
        >
          <option value="" disabled>
            Select a subject…
          </option>
          {SUBJECTS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select label="Grade" requiredMark error={errors.grade?.message} {...form.register("grade")}>
          <option value="" disabled>
            Select a grade…
          </option>
          {GRADES.filter((g) => g.slug !== "all").map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </Select>
        <Input
          label="Cover image URL"
          type="url"
          placeholder="https://…"
          hint="Optional — shown on catalog cards."
          error={errors.cover?.message}
          {...form.register("cover")}
        />
        <Input
          label="Price (EUR)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          hint="Leave empty for a free studybook."
          error={errors.priceEur?.message}
          {...form.register("priceEur")}
        />
        <div className="md:col-span-2">
          <Textarea
            label="Synopsis"
            requiredMark
            rows={4}
            placeholder="What is this studybook about, and who is it for?"
            error={errors.synopsis?.message}
            {...form.register("synopsis")}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <Button type="submit" loading={isSubmitting}>
            {book ? "Save changes" : "Create studybook"}
          </Button>
          <Link
            href="/admin/studybooks"
            className="text-muted hover:text-ink rounded-lg px-2 py-1 text-sm font-medium transition-colors"
          >
            Back to studybooks
          </Link>
          <span aria-live="polite" className="flex items-center gap-1.5">
            {saved && (
              <>
                <Check className="text-green-dark h-4 w-4" aria-hidden />
                <span className="text-green-dark text-sm font-medium">Saved</span>
              </>
            )}
          </span>
          <FieldError>{serverError}</FieldError>
        </div>
      </Form>
    </Card>
  );
}
