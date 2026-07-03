/** Display helpers shared by admin tables. Kept free of data-layer imports so client components can use them too. */
import { GRADES, SUBJECTS } from "@/config/subjects";

export function subjectName(slug: string): string {
  return SUBJECTS.find((s) => s.slug === slug)?.name ?? slug;
}

export function gradeLabel(slug: string): string {
  return GRADES.find((g) => g.slug === slug)?.label ?? slug;
}
