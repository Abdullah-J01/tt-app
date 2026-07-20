import type { Studybook } from "@/types";

/**
 * A studybook is "free" when it carries no unlock price (the app-wide
 * convention — see the price labels in Explore and the detail page). Free books
 * let a signed-out visitor read the first few cards before we ask them to log in
 * (instead of gating on open), so Explore can hook readers before the wall.
 */
export const isFreeBook = (book: Pick<Studybook, "priceEur">) => book.priceEur == null;

/**
 * Cards a signed-out visitor may read in a free studybook before the login gate.
 * Kept in step with StudybookPreview's peek so the "couple slides then sign in"
 * promise is the same whether they peek or open the full reader.
 */
export const FREE_PREVIEW_CARDS = 3;
