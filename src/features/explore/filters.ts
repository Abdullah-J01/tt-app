import { BookOpen, Globe, Shapes, Sparkles, Store, Tag, Users, type LucideIcon } from "lucide-react";
import { SUBJECTS } from "@/config/subjects";
import type { Studybook } from "@/types";

export interface FilterOption {
  value: string;
  label: string;
  /** Translation key under the `catalog` namespace (localized at render). */
  labelKey: string;
  /** Material count shown next to the label (subjects only for now). */
  count?: number;
  children?: FilterOption[];
}

export interface Facet {
  key: string;
  label: string;
  /** Translation key under the `catalog` namespace (localized at render). */
  labelKey: string;
  icon: LucideIcon;
  options: FilterOption[];
}

/** TT-style subject groups → real SUBJECTS slugs (config-driven, stays in sync). */
const SUBJECT_GROUPS: Record<string, { label: string; slugs: string[] }> = {
  languages: { label: "Languages", slugs: ["estonian", "english", "german", "finnish", "russian"] },
  mathematics: { label: "Mathematics", slugs: ["math"] },
  sciences: { label: "Natural Sciences", slugs: ["biology", "physics", "chemistry", "geography", "nature"] },
  social: { label: "Social Subjects", slugs: ["history", "human-education", "social-studies", "religion"] },
  arts: { label: "Arts & Culture", slugs: ["literature", "art-history", "music", "music-history", "media"] },
  practical: { label: "Practical", slugs: ["entrepreneurship", "traffic", "defense"] },
};

const SUBJECT_BY_SLUG = new Map(SUBJECTS.map((s) => [s.slug, s]));

function subjectOptions(): FilterOption[] {
  return Object.entries(SUBJECT_GROUPS).map(([value, group]) => {
    const children = group.slugs.flatMap((slug) => {
      const subject = SUBJECT_BY_SLUG.get(slug);
      return subject
        ? [
            {
              value: subject.slug,
              label: subject.name,
              labelKey: `subject.${subject.slug}`,
              count: subject.count,
            },
          ]
        : [];
    });
    return {
      value,
      label: group.label,
      labelKey: `group.${value}`,
      count: children.reduce((sum, c) => sum + (c.count ?? 0), 0),
      children,
    };
  });
}

/**
 * Catalog filter facets (mirrors TaskuTark's "Filter materials").
 * Target Group, Subject and Price filter real data (book.grade / subjectSlug /
 * priceEur); the rest are wired as UI until TT exposes facets.
 * TODO(team): drive counts + options from the TT API.
 */
export const FACETS: Facet[] = [
  {
    key: "target",
    label: "Target Group",
    labelKey: "facet.target",
    icon: Users,
    options: [
      { value: "preschool", label: "Preschool and Kindergarten", labelKey: "target.preschool" },
      { value: "1-3", label: "1-3 grades", labelKey: "target.1-3" },
      { value: "4-6", label: "4-6 grades", labelKey: "target.4-6" },
      { value: "7-9", label: "7-9 grades", labelKey: "target.7-9" },
      { value: "gymnasium", label: "Gymnasium", labelKey: "target.gymnasium" },
      { value: "self-study", label: "Self-study", labelKey: "target.self-study" },
      { value: "parents", label: "For Parents", labelKey: "target.parents" },
      { value: "teachers", label: "For Teachers", labelKey: "target.teachers" },
    ],
  },
  {
    key: "subject",
    label: "Subject",
    labelKey: "facet.subject",
    icon: BookOpen,
    options: subjectOptions(),
  },
  {
    key: "material",
    label: "Material Type",
    labelKey: "facet.material",
    icon: Shapes,
    options: [
      { value: "studybook", label: "Studybook", labelKey: "material.studybook" },
      { value: "support", label: "Support Material", labelKey: "material.support" },
      { value: "bite", label: "Bite", labelKey: "material.bite" },
      { value: "topic", label: "Topic", labelKey: "material.topic" },
      { value: "article", label: "Article", labelKey: "material.article" },
      { value: "test", label: "Test", labelKey: "material.test" },
    ],
  },
  {
    key: "price",
    label: "Price",
    labelKey: "facet.price",
    icon: Tag,
    options: [
      { value: "free", label: "Free", labelKey: "price.free" },
      { value: "paid", label: "Paid", labelKey: "price.paid" },
    ],
  },
  {
    key: "publisher",
    label: "Publisher",
    labelKey: "facet.publisher",
    icon: Store,
    options: [
      { value: "moorish", label: "Moorish", labelKey: "publisher.moorish" },
      { value: "meaningful-talks", label: "Meaningful Talks", labelKey: "publisher.meaningful-talks" },
      { value: "epr", label: "Estonian Packaging Recycling", labelKey: "publisher.epr" },
    ],
  },
  {
    key: "language",
    label: "Language",
    labelKey: "facet.language",
    icon: Globe,
    options: [
      { value: "et", label: "Estonian", labelKey: "language.et" },
      { value: "ru", label: "Russian", labelKey: "language.ru" },
    ],
  },
  {
    key: "special",
    label: "Special",
    labelKey: "facet.special",
    icon: Sparkles,
    options: [{ value: "et-second", label: "Estonian as a second language", labelKey: "special.et-second" }],
  },
];

/** Target Group values that map to a real book grade. */
export const GRADE_VALUES = new Set(["preschool", "1-3", "4-6", "7-9", "gymnasium"]);

/** Values checked under one facet, from composite "facetKey:value" keys. */
export function facetValues(selected: ReadonlySet<string>, facetKey: string): string[] {
  const prefix = `${facetKey}:`;
  return [...selected].filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length));
}

/**
 * Subject slugs effectively checked under the subject facet — checked groups
 * expand to all their member subjects.
 */
export function effectiveSubjectSlugs(selected: ReadonlySet<string>): Set<string> {
  return new Set(facetValues(selected, "subject").flatMap((v) => SUBJECT_GROUPS[v]?.slugs ?? [v]));
}

/**
 * Toggle one subject slug in the selection. If the slug is only selected via
 * its checked group, the group dissolves into its remaining siblings so
 * unticking a single subject keeps the rest of the group filtered.
 */
export function toggleSubjectSlug(selected: ReadonlySet<string>, slug: string): Set<string> {
  const next = new Set(selected);
  const key = `subject:${slug}`;

  const group = Object.entries(SUBJECT_GROUPS).find(([, g]) => g.slugs.includes(slug));
  const groupKey = group && `subject:${group[0]}`;
  if (groupKey && next.has(groupKey)) {
    next.delete(groupKey);
    next.delete(key);
    for (const sibling of group[1].slugs) if (sibling !== slug) next.add(`subject:${sibling}`);
    return next;
  }

  next.has(key) ? next.delete(key) : next.add(key);
  return next;
}

/**
 * Build a studybook predicate from the checked filters. Facets combine with
 * AND, values inside a facet with OR. A checked subject group means "any
 * subject in the group". Facets without a data mapping yet (material,
 * publisher, language, special) don't restrict results — TODO(team): filter
 * via the TT API.
 */
export function createFilterPredicate(selected: ReadonlySet<string>): (book: Studybook) => boolean {
  if (selected.size === 0) return () => true;

  const grades = facetValues(selected, "target").filter((v) => GRADE_VALUES.has(v));
  const subjects = effectiveSubjectSlugs(selected);
  const prices = facetValues(selected, "price");

  return (b) =>
    (grades.length === 0 || grades.includes(b.grade)) &&
    (subjects.size === 0 || subjects.has(b.subjectSlug)) &&
    (prices.length === 0 || prices.includes(b.priceEur ? "paid" : "free"));
}

/** Apply the checked filters to a list of studybooks. */
export function applyFilters(books: Studybook[], selected: ReadonlySet<string>): Studybook[] {
  return selected.size === 0 ? books : books.filter(createFilterPredicate(selected));
}

/** Human label for a composite "facetKey:value" key (active-filter pills). */
export function optionLabel(compositeKey: string): string {
  const i = compositeKey.indexOf(":");
  const facetKey = compositeKey.slice(0, i);
  const value = compositeKey.slice(i + 1);

  const walk = (options: FilterOption[]): string | undefined => {
    for (const option of options) {
      if (option.value === value) return option.label;
      const fromChild = option.children && walk(option.children);
      if (fromChild) return fromChild;
    }
  };

  const facet = FACETS.find((f) => f.key === facetKey);
  return (facet && walk(facet.options)) ?? value;
}

/** `catalog`-namespace translation key for a composite "facetKey:value" key. */
export function optionLabelKey(compositeKey: string): string | undefined {
  const i = compositeKey.indexOf(":");
  const facetKey = compositeKey.slice(0, i);
  const value = compositeKey.slice(i + 1);

  const walk = (options: FilterOption[]): string | undefined => {
    for (const option of options) {
      if (option.value === value) return option.labelKey;
      const fromChild = option.children && walk(option.children);
      if (fromChild) return fromChild;
    }
  };

  const facet = FACETS.find((f) => f.key === facetKey);
  return facet && walk(facet.options);
}
