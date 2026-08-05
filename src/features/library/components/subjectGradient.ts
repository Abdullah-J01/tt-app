const SUBJECT_GRADIENTS: Record<string, string> = {
  Physics: "from-plum-start to-plum-end",
  Biology: "from-green-mid to-green-bright",
  History: "from-violet-dark to-violet-light",
  Psychology: "from-amber-brown to-amber",
};
const DEFAULT_GRADIENT = "from-violet to-violet-dark";

/** On-brand gradient per subject, so cards/covers without a real image still look designed. */
export function subjectGradient(subject: string): string {
  return SUBJECT_GRADIENTS[subject] ?? DEFAULT_GRADIENT;
}
