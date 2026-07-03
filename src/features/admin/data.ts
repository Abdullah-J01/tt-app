/**
 * Admin-facing data layer, backed by a TEMPORARY in-memory store seeded from
 * the public catalog (src/lib/api.ts). Mutations visibly work in the UI during
 * dev but reset on server restart.
 *
 * TODO(team): TT owns all content — once TT exposes admin write endpoints
 * (docs/TT_API_ENDPOINTS.md), replace the store internals with ttApi.admin.*
 * calls and keep these function signatures; pages and actions won't change.
 */
import { listStudybooks } from "@/lib/api";
import { SUBJECTS, type Subject } from "@/config/subjects";
import type { Studybook } from "@/types";
import type { CardInput, StudybookInput } from "./schemas";

/** Store survives dev hot-reloads via globalThis; mock-only, never shipped. */
const g = globalThis as typeof globalThis & {
  __adminCatalog?: Promise<Map<string, Studybook>>;
};

function catalog(): Promise<Map<string, Studybook>> {
  g.__adminCatalog ??= listStudybooks().then(
    (books) => new Map(books.map((b) => [b.slug, structuredClone(b)])),
  );
  return g.__adminCatalog;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

// ─── Studybooks ─────────────────────────────────────────────────────

export interface StudybookQuery {
  /** Free-text match against title + author. */
  q?: string;
  subject?: string;
  grade?: string;
  page?: number;
  perPage?: number;
}

export interface StudybookPage {
  items: Studybook[];
  total: number;
  page: number;
  totalPages: number;
}

export async function adminListStudybooks(query: StudybookQuery = {}): Promise<StudybookPage> {
  const { q, subject, grade, perPage = 10 } = query;
  const needle = q?.trim().toLowerCase();

  let items = [...(await catalog()).values()];
  if (needle) items = items.filter((b) => `${b.title} ${b.author}`.toLowerCase().includes(needle));
  if (subject) items = items.filter((b) => b.subjectSlug === subject);
  if (grade && grade !== "all") items = items.filter((b) => b.grade === grade);
  items.sort((a, b) => a.title.localeCompare(b.title));

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  return { items: items.slice((page - 1) * perPage, page * perPage), total, page, totalPages };
}

export async function adminGetStudybook(slug: string): Promise<Studybook | undefined> {
  return (await catalog()).get(slug);
}

export async function adminCreateStudybook(input: StudybookInput): Promise<Studybook> {
  const books = await catalog();
  const base = slugify(input.title) || "studybook";
  let slug = base;
  for (let n = 2; books.has(slug); n++) slug = `${base}-${n}`;

  const book: Studybook = { id: crypto.randomUUID(), slug, cards: [], ...input };
  books.set(slug, book);
  return book;
}

export async function adminUpdateStudybook(
  slug: string,
  input: StudybookInput,
): Promise<Studybook | undefined> {
  const books = await catalog();
  const existing = books.get(slug);
  if (!existing) return undefined;

  const updated: Studybook = { ...existing, ...input };
  books.set(slug, updated);
  return updated;
}

export async function adminDeleteStudybook(slug: string): Promise<boolean> {
  return (await catalog()).delete(slug);
}

/** Replaces a studybook's cards in the given order; new cards get generated ids. */
export async function adminSaveCards(
  slug: string,
  cards: CardInput[],
): Promise<Studybook | undefined> {
  const books = await catalog();
  const existing = books.get(slug);
  if (!existing) return undefined;

  const updated: Studybook = {
    ...existing,
    cards: cards.map((c) => ({ id: c.id ?? crypto.randomUUID(), heading: c.heading, body: c.body })),
  };
  books.set(slug, updated);
  return updated;
}

// ─── Subjects (taxonomy is owned by TT — read-only here) ───────────

export interface AdminSubjectRow {
  subject: Subject;
  /** Studybooks currently in this catalog for the subject. */
  studybooks: number;
}

export async function adminListSubjects(): Promise<AdminSubjectRow[]> {
  const books = [...(await catalog()).values()];
  return SUBJECTS.map((subject) => ({
    subject,
    studybooks: books.filter((b) => b.subjectSlug === subject.slug).length,
  }));
}

// ─── Users (no TT users endpoint yet — mock list, seam ready) ──────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  plan: "free" | "premium";
  /** ISO date the account was created. */
  joinedAt: string;
}

const MOCK_USERS: AdminUser[] = [
  { id: "u1", name: "Admin", email: "admin@studybooks.app", role: "admin", plan: "premium", joinedAt: "2025-11-02" },
  { id: "u2", name: "Mari Tamm", email: "mari.tamm@example.com", role: "user", plan: "premium", joinedAt: "2026-01-14" },
  { id: "u3", name: "Jaan Kask", email: "jaan.kask@example.com", role: "user", plan: "free", joinedAt: "2026-01-21" },
  { id: "u4", name: "Liis Saar", email: "liis.saar@example.com", role: "user", plan: "free", joinedAt: "2026-02-03" },
  { id: "u5", name: "Karl Mets", email: "karl.mets@example.com", role: "user", plan: "premium", joinedAt: "2026-02-17" },
  { id: "u6", name: "Anna Kivi", email: "anna.kivi@example.com", role: "user", plan: "free", joinedAt: "2026-03-05" },
  { id: "u7", name: "Peeter Lepp", email: "peeter.lepp@example.com", role: "user", plan: "free", joinedAt: "2026-03-22" },
  { id: "u8", name: "Kati Kuusk", email: "kati.kuusk@example.com", role: "user", plan: "premium", joinedAt: "2026-04-09" },
  { id: "u9", name: "Toomas Ilves", email: "toomas.i@example.com", role: "user", plan: "free", joinedAt: "2026-05-01" },
  { id: "u10", name: "Eva Rebane", email: "eva.rebane@example.com", role: "user", plan: "free", joinedAt: "2026-05-28" },
  { id: "u11", name: "Marta Jõgi", email: "marta.jogi@example.com", role: "user", plan: "premium", joinedAt: "2026-06-11" },
  { id: "u12", name: "Siim Vaher", email: "siim.vaher@example.com", role: "user", plan: "free", joinedAt: "2026-06-30" },
];

export interface UserQuery {
  q?: string;
  page?: number;
  perPage?: number;
}

export interface UserPage {
  items: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export async function adminListUsers(query: UserQuery = {}): Promise<UserPage> {
  const { q, perPage = 10 } = query;
  const needle = q?.trim().toLowerCase();

  let items = MOCK_USERS;
  if (needle) items = items.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(needle));

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  return { items: items.slice((page - 1) * perPage, page * perPage), total, page, totalPages };
}

// ─── Dashboard ──────────────────────────────────────────────────────

export interface AdminStats {
  studybooks: number;
  cards: number;
  subjects: number;
  users: number;
}

export async function adminStats(): Promise<AdminStats> {
  const books = [...(await catalog()).values()];
  return {
    studybooks: books.length,
    cards: books.reduce((sum, b) => sum + b.cards.length, 0),
    subjects: SUBJECTS.length,
    users: MOCK_USERS.length,
  };
}
