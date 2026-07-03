"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { cardsSchema, studybookSchema } from "./schemas";
import {
  adminCreateStudybook,
  adminDeleteStudybook,
  adminSaveCards,
  adminUpdateStudybook,
} from "./data";

/**
 * Admin CMS mutations. Every action re-checks the admin session — the layout
 * guard does not protect directly-invoked server actions — and re-validates its
 * payload with the shared Zod schema before touching data.
 */

export interface AdminActionResult {
  ok: boolean;
  /** Safe-to-display message when `ok` is false. */
  error?: string;
  /** Slug of the affected studybook (create may generate a new one). */
  slug?: string;
}

function invalid(message: string): AdminActionResult {
  return { ok: false, error: message };
}

export async function createStudybook(input: unknown): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = studybookSchema.safeParse(input);
  if (!parsed.success) return invalid("Some fields are invalid — check the form and try again.");

  const book = await adminCreateStudybook(parsed.data);
  revalidatePath("/admin", "layout");
  return { ok: true, slug: book.slug };
}

export async function updateStudybook(slug: string, input: unknown): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = studybookSchema.safeParse(input);
  if (!parsed.success) return invalid("Some fields are invalid — check the form and try again.");

  const book = await adminUpdateStudybook(slug, parsed.data);
  if (!book) return invalid("This studybook no longer exists.");
  revalidatePath("/admin", "layout");
  revalidatePath(`/studybook/${slug}`);
  return { ok: true, slug: book.slug };
}

export async function deleteStudybook(slug: string): Promise<AdminActionResult> {
  await requireAdmin();
  const deleted = await adminDeleteStudybook(slug);
  if (!deleted) return invalid("This studybook no longer exists.");
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Replaces a studybook's bite cards with the given ordered list. */
export async function saveStudybookCards(slug: string, cards: unknown): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = cardsSchema.safeParse(cards);
  if (!parsed.success) return invalid("Every card needs a heading and body text.");

  const book = await adminSaveCards(slug, parsed.data);
  if (!book) return invalid("This studybook no longer exists.");
  revalidatePath("/admin", "layout");
  revalidatePath(`/studybook/${slug}`);
  return { ok: true, slug: book.slug };
}
