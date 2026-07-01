import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Pill } from "./Pill";
import { IllustrationPlaceholder } from "./IllustrationPlaceholder";

/** Which way the card lays its media + content out. */
export type ContentCardLayout = "horizontal" | "vertical";

export interface ContentTag {
  label: string;
  /** Optional leading glyph — auto-sized by Pill. */
  icon?: ReactNode;
  /** Pill variant; defaults to the neutral grey `mist` tag. */
  variant?: "mist" | "ink" | "green" | "amber" | "solid" | "default";
}

export interface ContentCardProps {
  /** The only required field — everything else is optional and rendered when present. */
  title: string;
  /**
   * `horizontal` = media left, content right (roomy, fits a description).
   * `vertical`   = media on top, content below (compact tile).
   */
  layout?: ContentCardLayout;
  /**
   * Caller-owned media node (an `<img>`, `next/image`, etc.). Falls back to an
   * illustration placeholder when omitted, so the card never renders an empty box.
   */
  media?: ReactNode;
  /** Supporting copy — clamped. Typically only supplied for the horizontal layout. */
  description?: string;
  /** Price value, e.g. `"1.90€"`. Rendered in a violet pill only when present. */
  price?: ReactNode;
  /** Small prefix inside the price pill, e.g. `"al"` (from). */
  pricePrefix?: string;
  /** Meta tags (publisher, category, product). Rendered as pills; omit for none. */
  tags?: ContentTag[];
  /** When set, the whole card becomes a link to this href. */
  href?: string;
  className?: string;
}

/**
 * One catalog card, two layouts (UI brief — "õpiampsud" rows + "digiteeritud" tiles).
 * Every field beyond `title` is optional and conditionally rendered, so partial data
 * never throws. Width is owned by the parent (e.g. `CardRail`); the card fills it.
 */
export function ContentCard({
  title,
  layout = "vertical",
  media,
  description,
  price,
  pricePrefix,
  tags,
  href,
  className,
}: ContentCardProps) {
  const isHorizontal = layout === "horizontal";
  const hasMeta = price != null || (tags != null && tags.length > 0);

  const root = cn(
    "group h-full overflow-hidden rounded-card border border-hairline bg-surface text-left",
    "transition-[transform,box-shadow,border-color] duration-200",
    href &&
      "hover:-translate-y-0.5 hover:border-lavender hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/40",
    // Horizontal is a 2-col grid so children can re-flow between breakpoints:
    //   mobile  → image | title / meta stacked beside it, description full-width below
    //   desktop → image | title, description, meta stacked in the right column
    isHorizontal
      ? "grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 p-3 sm:gap-x-4 sm:p-4"
      : "flex flex-col p-3",
    className,
  );

  const mediaBox = (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-lavender",
        "[&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-cover",
        isHorizontal
          ? "col-start-1 row-start-1 row-span-2 h-24 w-24 self-start sm:h-28 sm:w-28 md:row-span-3"
          : "aspect-[3/4] w-full",
      )}
    >
      {media ?? <IllustrationPlaceholder className="h-full w-full rounded-none" />}
    </div>
  );

  const titleEl = (
    <h3
      className={cn(
        "min-w-0 break-words font-bold leading-snug text-ink",
        isHorizontal
          ? "col-start-2 row-start-1 line-clamp-2 text-sm sm:text-base"
          : "line-clamp-3 text-sm sm:text-base",
      )}
    >
      {title}
    </h3>
  );

  const descriptionText = description ? (
    <p
      className={cn(
        "min-w-0 line-clamp-3 text-sm leading-relaxed text-muted",
        !isHorizontal && "mt-1.5",
      )}
    >
      {description}
    </p>
  ) : null;

  // Horizontal keeps the mobile row compact (image + title + meta only) and only
  // reveals the description from `md` up, in the right-hand column. The wrapper
  // carries `hidden`/`md:block` so they don't collide with the <p>'s line-clamp
  // (both live in tailwind-merge's display group and one would be dropped).
  const descEl =
    descriptionText && isHorizontal ? (
      <div className="hidden md:col-start-2 md:row-start-2 md:block">{descriptionText}</div>
    ) : (
      descriptionText
    );

  const metaEl = hasMeta ? (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        isHorizontal
          ? "col-start-2 row-start-2 md:row-start-3"
          : "mt-auto pt-3",
      )}
    >
      {price != null && (
        <Pill>
          {pricePrefix && <span className="font-medium opacity-70">{pricePrefix}</span>}
          {price}
        </Pill>
      )}
      {tags?.map((tag, i) => (
        <Pill key={`${tag.label}-${i}`} variant={tag.variant ?? "mist"} icon={tag.icon}>
          {tag.label}
        </Pill>
      ))}
    </div>
  ) : null;

  // Horizontal places children directly in the grid; vertical keeps its content
  // stacked in a flex column beneath the media.
  const inner = isHorizontal ? (
    <>
      {mediaBox}
      {titleEl}
      {descEl}
      {metaEl}
    </>
  ) : (
    <>
      {mediaBox}
      <div className="flex min-w-0 flex-1 flex-col pt-3">
        {titleEl}
        {descEl}
        {metaEl}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={root}>
        {inner}
      </Link>
    );
  }
  return <article className={root}>{inner}</article>;
}
