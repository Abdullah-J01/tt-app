/**
 * Zod schemas for the Admin CMS. Shared by the client forms (via `useZodForm`)
 * and re-validated inside every server action — the schema is the single source
 * of truth for what a valid studybook/card looks like.
 */
import { z } from "zod";

export const studybookSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  author: z.string().trim().min(2, "Author is required"),
  year: z.coerce
    .number("Enter a year")
    .int("Enter a whole year")
    .min(1000, "Enter a full year, e.g. 2021")
    .max(2100, "That year looks wrong"),
  subjectSlug: z.string().min(1, "Pick a subject"),
  grade: z.string().min(1, "Pick a grade"),
  category: z.string().trim().min(2, "Category is required"),
  synopsis: z.string().trim().min(10, "Write a short synopsis (at least 10 characters)"),
  cover: z
    .union([z.url("Enter a valid image URL"), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  priceEur: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number("Enter a price").min(0, "Price can't be negative").optional(),
  ),
});

export type StudybookInput = z.output<typeof studybookSchema>;

export const studyCardSchema = z.object({
  /** Present when editing an existing card; omitted for new ones. */
  id: z.string().optional(),
  heading: z.string().trim().min(1, "Every card needs a heading").max(140, "Keep headings short"),
  body: z.string().trim().min(1, "Every card needs body text"),
});

export const cardsSchema = z.array(studyCardSchema).max(100, "Too many cards");

export type CardInput = z.output<typeof studyCardSchema>;
