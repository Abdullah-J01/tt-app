import {
  Atom,
  Baby,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe2,
  GraduationCap,
  Landmark,
  Languages,
  Leaf,
  Music,
  Palette,
  School,
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

export interface Grade {
  slug: string;
  label: string;
  /** Icon + subtitle drive the onboarding grade cards; absent on the "All" filter. */
  icon?: LucideIcon;
  subtitle?: string;
}

export const GRADES: Grade[] = [
  { slug: "all", label: "All" },
  { slug: "preschool", label: "Preschool", icon: Baby, subtitle: "Ages 3–6" },
  { slug: "1-3", label: "Grades 1–3", icon: School, subtitle: "Early primary" },
  { slug: "4-6", label: "Grades 4–6", icon: School, subtitle: "Upper primary" },
  { slug: "7-9", label: "Grades 7–9", icon: BookOpen, subtitle: "Middle school" },
  { slug: "gymnasium", label: "Gymnasium", icon: GraduationCap, subtitle: "High school" },
];

/** Daily-goal presets (cards/day) offered in onboarding step 3. */
export const DAILY_GOALS = [3, 5, 10] as const;
