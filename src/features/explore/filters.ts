import { BookOpen, Globe, Shapes, Sparkles, Store, Users, type LucideIcon } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  children?: FilterOption[];
}

export interface Facet {
  key: string;
  label: string;
  icon: LucideIcon;
  options: FilterOption[];
}

/**
 * Catalog filter facets (mirrors TaskuTark's "Filter materials").
 * TODO(team): drive counts + options from the TT API. Only Target Group maps to
 * our current data (book.grade); the rest are wired as UI until TT exposes facets.
 */
export const FACETS: Facet[] = [
  {
    key: "target",
    label: "Target Group",
    icon: Users,
    options: [
      { value: "preschool", label: "Preschool and Kindergarten" },
      { value: "1-3", label: "1-3 grades" },
      { value: "4-6", label: "4-6 grades" },
      { value: "7-9", label: "7-9 grades" },
      { value: "gymnasium", label: "Gymnasium" },
      { value: "self-study", label: "Self-study" },
      { value: "parents", label: "For Parents" },
      { value: "teachers", label: "For Teachers" },
    ],
  },
  {
    key: "subject",
    label: "Subject",
    icon: BookOpen,
    options: [
      { value: "language-literature", label: "Language and Literature" },
      { value: "mathematics", label: "Mathematics" },
      { value: "nature", label: "Nature Substances" },
      {
        value: "social",
        label: "Social Subjects",
        children: [
          { value: "history", label: "History" },
          { value: "human-education", label: "Human Education" },
          { value: "social-studies", label: "Social Studies" },
        ],
      },
      { value: "foreign-languages", label: "Foreign Languages" },
      { value: "art", label: "Art" },
      { value: "optional", label: "Optional Subjects" },
    ],
  },
  {
    key: "material",
    label: "Material Type",
    icon: Shapes,
    options: [
      { value: "studybook", label: "Studybook" },
      { value: "support", label: "Support Material" },
      { value: "bite", label: "Bite" },
      { value: "topic", label: "Topic" },
      { value: "article", label: "Article" },
      { value: "test", label: "Test" },
    ],
  },
  {
    key: "publisher",
    label: "Publisher",
    icon: Store,
    options: [
      { value: "moorish", label: "Moorish" },
      { value: "meaningful-talks", label: "Meaningful Talks" },
      { value: "epr", label: "Estonian Packaging Recycling" },
    ],
  },
  {
    key: "language",
    label: "Language",
    icon: Globe,
    options: [
      { value: "et", label: "Estonian" },
      { value: "ru", label: "Russian" },
    ],
  },
  {
    key: "special",
    label: "Special",
    icon: Sparkles,
    options: [{ value: "et-second", label: "Estonian as a second language" }],
  },
];
