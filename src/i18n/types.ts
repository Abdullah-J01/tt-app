import type { ReactNode } from "react";

/** Scalar values for interpolation / ICU plural & select. */
export type TranslateValues = Record<string, string | number | boolean | Date | null | undefined>;

/** A rich-text tag renderer, e.g. `strong: (chunks) => <strong>{chunks}</strong>`. */
export type RichTag = (chunks: ReactNode) => ReactNode;

/** Values for `t.rich` — tag renderers plus any scalar placeholders. */
export type RichValues = Record<string, RichTag | string | number | boolean | ReactNode>;

/** next-intl-compatible translator returned by `useTranslations` / `getTranslations`. */
export interface Translator {
  (key: string, values?: TranslateValues): string;
  rich: (key: string, values?: RichValues) => ReactNode;
}
