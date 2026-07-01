import { cn } from "@/lib/utils";
import { ActionRail } from "./ActionRail";

interface StudyCardProps {
  heading: string;
  body: string;
  subjectLabel: string;
  bookTitle: string;
  author: string;
  /** 0-based position within the studybook. */
  index: number;
  total: number;
}

/**
 * Immersive full-screen learning card (UI brief §4.1).
 * Full-height, snap target, plum gradient background, right-side action rail.
 */
export function StudyCard({
  heading,
  body,
  subjectLabel,
  bookTitle,
  author,
  index,
  total,
}: StudyCardProps) {
  return (
    <article className="snap-card relative flex h-[100svh] w-full flex-col justify-between overflow-hidden bg-plum p-6 text-white">
      {/* Top: progress + subject */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-1" aria-label={`Card ${index + 1} of ${total}`}>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full",
                i <= index ? "bg-white" : "bg-white/30",
              )}
            />
          ))}
        </div>
        <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
          {subjectLabel}
        </span>
      </div>

      {/* Center: the bite */}
      <div className="max-w-md pr-16">
        <h2 className="text-3xl font-bold leading-tight text-white">{heading}</h2>
        <p className="mt-4 text-lg leading-relaxed text-white/90">{body}</p>
      </div>

      {/* Bottom: attribution */}
      <div className="flex items-center gap-3 pr-16">
        <div className="h-12 w-9 shrink-0 rounded-md bg-white/20" aria-hidden />
        <div className="min-w-0">
          <p className="truncate font-semibold">{bookTitle}</p>
          <p className="truncate text-sm text-white/70">{author}</p>
        </div>
      </div>

      {/* Right: action rail */}
      <div className="absolute bottom-24 right-4">
        <ActionRail likeCount={128} />
      </div>
    </article>
  );
}
