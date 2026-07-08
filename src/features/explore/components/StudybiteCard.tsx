"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "@/i18n/client";
import { Pill } from "@/components/ui/Pill";
import { SUBJECTS } from "@/config/subjects";
import type { Studybite } from "../data";

function subjectName(slug: string) {
  return SUBJECTS.find((s) => s.slug === slug)?.name ?? slug;
}

/**
 * A single "bite" (one card) shown as a horizontal card: cover thumb, the card
 * heading, a snippet, and price + subject pills. Opens the studybook's reader.
 */
export function StudybiteCard({ bite }: { bite: Studybite }) {
  const t = useTranslations("features_explore_components_StudybiteCard");
  const { card, book } = bite;
  return (
    <Link
      href={`/studybook/${book.slug}/read`}
      className="hover-lift group flex gap-3 rounded-card border border-hairline bg-surface p-3"
    >
      <div className="bg-plum relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-lg">
        {book.cover && (
          <Image src={book.cover} alt={book.title} fill sizes="56px" className="object-cover" />
        )}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 font-semibold leading-snug group-hover:text-violet">
          {card.heading}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{card.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {book.priceEur != null ? (
            <Pill>€{book.priceEur.toFixed(2)}</Pill>
          ) : (
            <Pill className="bg-brand-green/10 text-brand-green">{t("included")}</Pill>
          )}
          <Pill className="bg-lavender">{subjectName(book.subjectSlug)}</Pill>
        </div>
      </div>
    </Link>
  );
}