import {
  Atom,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  Leaf,
  Music,
  Palette,
  type LucideIcon,
} from "lucide-react";

export interface Subject {
  slug: string;
  name: string;
  icon: LucideIcon;
  /** Placeholder counts — replace with real data from the API. */
  count: number;
}

/** Seed subjects mirroring TaskuTark's catalog. Extend/replace via the CMS. */
export const SUBJECTS: Subject[] = [
  { slug: "math", name: "Mathematics", icon: Calculator, count: 5936 },
  { slug: "estonian", name: "Estonian", icon: BookOpen, count: 9077 },
  { slug: "history", name: "History", icon: Landmark, count: 4285 },
  { slug: "biology", name: "Biology", icon: Leaf, count: 749 },
  { slug: "physics", name: "Physics", icon: Atom, count: 570 },
  { slug: "chemistry", name: "Chemistry", icon: FlaskConical, count: 1142 },
  { slug: "geography", name: "Geography", icon: Globe2, count: 468 },
  { slug: "english", name: "English", icon: Languages, count: 249 },
  { slug: "art-history", name: "Art History", icon: Palette, count: 43 },
  { slug: "music", name: "Music", icon: Music, count: 416 },
];

export const GRADES = [
  { slug: "all", label: "All" },
  { slug: "preschool", label: "Preschool" },
  { slug: "1-3", label: "Grades 1–3" },
  { slug: "4-6", label: "Grades 4–6" },
  { slug: "7-9", label: "Grades 7–9" },
  { slug: "gymnasium", label: "Gymnasium" },
] as const;
