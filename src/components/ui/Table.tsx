import { cn } from "@/lib/utils";
import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Class for the bordered, scrollable wrapper (vs `className`, applied to the `<table>`). */
  containerClassName?: string;
}

/**
 * Composable data table on the standard list surface: hairline card wrapper,
 * lavender header band, hairline row dividers. Wide tables scroll inside the
 * wrapper rather than the page.
 *
 * @example
 * <Table>
 *   <TableHead>
 *     <tr><TableHeaderCell>Title</TableHeaderCell></tr>
 *   </TableHead>
 *   <TableBody>
 *     <TableRow><TableCell>…</TableCell></TableRow>
 *   </TableBody>
 * </Table>
 */
export function Table({ containerClassName, className, ...props }: TableProps) {
  return (
    <div
      className={cn(
        // `relative` anchors absolutely-positioned descendants (e.g. sr-only
        // labels) so they can't escape the scroll container and widen the page.
        "rounded-card border-hairline bg-surface relative overflow-x-auto border",
        containerClassName,
      )}
    >
      {/* min-width keeps columns readable on narrow screens — the wrapper scrolls instead. */}
      <table className={cn("w-full min-w-[40rem] text-left text-sm", className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-lavender/60 text-muted", className)} {...props} />;
}

/** Body rows get the shared hover tint; pass `className` to opt a body out. */
export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("divide-hairline divide-y [&>tr]:transition-colors", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-lavender/30", className)} {...props} />;
}

export function TableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-4 py-3 font-semibold whitespace-nowrap", className)} {...props} />;
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3", className)} {...props} />;
}
