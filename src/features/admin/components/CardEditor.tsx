"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/client";
import { ArrowDown, ArrowUp, Check, Layers, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { StudyCard } from "@/types";
import { saveStudybookCards } from "../actions";
import { cardsSchema } from "../schemas";

interface EditorCard {
  /** Stable client key — the card id for existing cards, a local key for new ones. */
  key: string;
  id?: string;
  heading: string;
  body: string;
}

interface CardEditorProps {
  slug: string;
  initialCards: StudyCard[];
}

/**
 * Bite-card editor: add, edit, reorder (button-based, keyboard-friendly) and
 * delete cards, then save the whole ordered list in one action.
 */
export function CardEditor({ slug, initialCards }: CardEditorProps) {
  const router = useRouter();
  const t = useTranslations("features_admin_components_CardEditor");
  const counter = useRef(0);
  const [cards, setCards] = useState<EditorCard[]>(() =>
    initialCards.map((c) => ({ key: c.id, id: c.id, heading: c.heading, body: c.body })),
  );
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const edit = (updater: (prev: EditorCard[]) => EditorCard[]) => {
    setCards(updater);
    setDirty(true);
    setSaved(false);
    setError(null);
  };

  const addCard = () =>
    edit((prev) => [...prev, { key: `new-${counter.current++}`, heading: "", body: "" }]);

  const removeCard = (key: string) => edit((prev) => prev.filter((c) => c.key !== key));

  const setField = (key: string, field: "heading" | "body", value: string) =>
    edit((prev) => prev.map((c) => (c.key === key ? { ...c, [field]: value } : c)));

  const moveCard = (index: number, delta: -1 | 1) =>
    edit((prev) => {
      const card = prev[index];
      const target = prev[index + delta];
      if (!card || !target) return prev;
      const next = [...prev];
      next[index] = target;
      next[index + delta] = card;
      return next;
    });

  const save = () => {
    const parsed = cardsSchema.safeParse(cards.map(({ id, heading, body }) => ({ id, heading, body })));
    if (!parsed.success) {
      setError(t("validationError"));
      return;
    }
    startTransition(async () => {
      const result = await saveStudybookCards(slug, parsed.data);
      if (!result.ok) {
        setError(result.error ?? t("genericError"));
        return;
      }
      setDirty(false);
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <section aria-label={t("cardsAriaLabel")} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-ink text-lg font-bold">{t("title", { count: cards.length })}</h2>
          <p className="text-muted text-sm">
            {t("subtitle")}
          </p>
        </div>
        <Button variant="secondary" size="sm" leadingIcon={<Plus />} onClick={addCard}>
          {t("addCard")}
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Layers />}
            title={t("emptyTitle")}
            description={t("emptyBody")}
          />
        </Card>
      ) : (
        <ol className="flex flex-col gap-3">
          {cards.map((card, i) => (
            <li key={card.key}>
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="bg-lavender text-violet grid h-7 w-7 place-items-center rounded-full text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-muted text-xs font-semibold tracking-wide uppercase">
                      {t("cardLabel", { number: i + 1 })}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Button
                      unstyled
                      type="button"
                      aria-label={t("moveUp", { number: i + 1 })}
                      disabled={i === 0}
                      onClick={() => moveCard(i, -1)}
                      className="text-muted hover:bg-lavender hover:text-violet disabled:text-faint grid h-8 w-8 place-items-center rounded-lg transition-colors disabled:hover:bg-transparent"
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                      unstyled
                      type="button"
                      aria-label={t("moveDown", { number: i + 1 })}
                      disabled={i === cards.length - 1}
                      onClick={() => moveCard(i, 1)}
                      className="text-muted hover:bg-lavender hover:text-violet disabled:text-faint grid h-8 w-8 place-items-center rounded-lg transition-colors disabled:hover:bg-transparent"
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                      unstyled
                      type="button"
                      aria-label={t("deleteCard", { number: i + 1 })}
                      onClick={() => removeCard(card.key)}
                      className="text-muted hover:bg-danger-tint hover:text-danger grid h-8 w-8 place-items-center rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </span>
                </div>
                <Input
                  aria-label={t("headingAriaLabel", { number: i + 1 })}
                  placeholder={t("headingPlaceholder")}
                  containerClassName="h-11"
                  value={card.heading}
                  onChange={(e) => setField(card.key, "heading", e.target.value)}
                />
                <Textarea
                  aria-label={t("bodyAriaLabel", { number: i + 1 })}
                  placeholder={t("bodyPlaceholder")}
                  rows={3}
                  containerClassName="min-h-0"
                  value={card.body}
                  onChange={(e) => setField(card.key, "body", e.target.value)}
                />
              </Card>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} loading={pending} disabled={!dirty}>
          {t("saveCards")}
        </Button>
        <span aria-live="polite" className="flex items-center gap-1.5">
          {saved && (
            <>
              <Check className="text-green-dark h-4 w-4" aria-hidden />
              <span className="text-green-dark text-sm font-medium">{t("saved")}</span>
            </>
          )}
          {dirty && !pending && <span className="text-muted text-sm">{t("unsavedChanges")}</span>}
        </span>
        <FieldError>{error}</FieldError>
      </div>
    </section>
  );
}
