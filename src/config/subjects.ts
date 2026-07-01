import {
  Atom,
  BookOpen,
  Briefcase,
  Calculator,
  Car,
  Church,
  FlaskConical,
  Globe2,
  Languages,
  Leaf,
  Music,
  Newspaper,
  Palette,
  ScrollText,
  Shield,
  Trees,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface Subject {
  slug: string;
  name: string;
  icon: LucideIcon;
  /** Tailwind text-color utility for the icon (per-subject accent). */
  color: string;
  /** Placeholder counts — replace with real data from the API. */
  count: number;
}

/** Full TaskuTark catalog of subjects + material counts. */
export const SUBJECTS: Subject[] = [
  { slug: "history", name: "History", icon: ScrollText, color: "text-amber", count: 4285 },
  { slug: "biology", name: "Biology", icon: Leaf, color: "text-brand-green", count: 749 },
  { slug: "estonian", name: "Estonian language", icon: Languages, color: "text-violet", count: 9079 },
  { slug: "entrepreneurship", name: "Entrepreneurship", icon: Briefcase, color: "text-ink", count: 144 },
  { slug: "physics", name: "Physics", icon: Atom, color: "text-amber", count: 570 },
  { slug: "geography", name: "Geography", icon: Globe2, color: "text-brand-green", count: 468 },
  { slug: "english", name: "English language", icon: Languages, color: "text-violet", count: 249 },
  { slug: "human-education", name: "Human Education", icon: User, color: "text-ink", count: 1169 },
  { slug: "chemistry", name: "Chemistry", icon: FlaskConical, color: "text-brand-green", count: 1142 },
  { slug: "literature", name: "Literature", icon: BookOpen, color: "text-violet", count: 1442 },
  { slug: "art-history", name: "Art History", icon: Palette, color: "text-amber", count: 43 },
  { slug: "traffic", name: "Traffic", icon: Car, color: "text-ink", count: 112 },
  { slug: "nature", name: "Nature", icon: Trees, color: "text-brand-green", count: 2432 },
  { slug: "math", name: "Mathematics", icon: Calculator, color: "text-ink", count: 5936 },
  { slug: "media", name: "Media", icon: Newspaper, color: "text-violet", count: 186 },
  { slug: "music-history", name: "Music History", icon: Music, color: "text-amber", count: 36 },
  { slug: "music", name: "Music", icon: Music, color: "text-violet", count: 416 },
  { slug: "defense", name: "Defense", icon: Shield, color: "text-ink", count: 19 },
  { slug: "german", name: "German language", icon: Languages, color: "text-amber", count: 99 },
  { slug: "finnish", name: "Finnish language", icon: Languages, color: "text-brand-green", count: 96 },
  { slug: "social-studies", name: "Social Studies", icon: Users, color: "text-violet", count: 1216 },
  { slug: "religion", name: "Religion", icon: Church, color: "text-ink", count: 168 },
  { slug: "russian", name: "Russian language", icon: Languages, color: "text-amber", count: 604 },
];

export const GRADES = [
  { slug: "all", label: "All" },
  { slug: "preschool", label: "Preschool" },
  { slug: "1-3", label: "Grades 1–3" },
  { slug: "4-6", label: "Grades 4–6" },
  { slug: "7-9", label: "Grades 7–9" },
  { slug: "gymnasium", label: "Gymnasium" },
] as const;
