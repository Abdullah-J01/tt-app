/**
 * TEMPORARY dummy catalog from the Open Library public API (no key required).
 *
 * We have no real content API yet, so — only in mock mode (see src/lib/api.ts) —
 * we pull real book titles/authors/covers/subjects from Open Library to make the
 * catalog look alive. The bite-sized "cards" don't exist in any book API, so they
 * are synthesized locally. If the network is unavailable, we fall back to the
 * hand-written MOCK_STUDYBOOKS so the UI always renders.
 *
 * TODO(team): delete this file once the TaskuTark content API is live — real
 * studybooks + real cards come from ttApi then.
 */
import { SUBJECTS } from "@/config/subjects";
import { MOCK_STUDYBOOKS } from "./mock-data";
import { getTranslations } from "@/i18n/server";
import type { Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/types";
import type { Studybook } from "@/types";

/** Our subject slug → an Open Library subject that reliably returns books. */
const OL_SUBJECT: Record<string, string> = {
  history: "history",
  biology: "biology",
  estonian: "literature",
  entrepreneurship: "business",
  physics: "physics",
  geography: "geography",
  english: "language",
  "human-education": "psychology",
  chemistry: "chemistry",
  literature: "literature",
  "art-history": "art",
  traffic: "science",
  nature: "nature",
  math: "mathematics",
  media: "journalism",
  "music-history": "music",
  music: "music",
  defense: "history",
  german: "language",
  finnish: "language",
  "social-studies": "sociology",
  religion: "religion",
  russian: "language",
};

const GRADES = ["1-3", "4-6", "7-9", "gymnasium"] as const;
const PER_SUBJECT = 8;

interface OLWork {
  key: string;
  title: string;
  authors?: { name: string }[];
  cover_id?: number;
  first_publish_year?: number;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Generic "bites" so the reader/preview have content (no book API provides these). */
function synthCards(id: string, title: string, subject: string, t: Translator): Studybook["cards"] {
  return [
    {
      id: `${id}-c1`,
      heading: t("card.bigIdeaHeading", { title }),
      body: t("card.bigIdeaBody", { subject, title }),
    },
    {
      id: `${id}-c2`,
      heading: t("card.rememberHeading"),
      body: t("card.rememberBody", { subject }),
    },
    {
      id: `${id}-c3`,
      heading: t("card.mattersHeading"),
      body: t("card.mattersBody"),
    },
  ];
}

function mapWork(work: OLWork, subjectSlug: string, subjectName: string, t: Translator): Studybook | null {
  if (!work.title) return null;
  const olId = work.key.replace("/works/", "");
  const id = `ol_${olId}`;
  const slug = `${slugify(work.title)}-${olId.toLowerCase()}`;
  const seed = hash(olId);
  return {
    id,
    slug,
    title: work.title,
    author: work.authors?.[0]?.name ?? t("unknownAuthor"),
    year: work.first_publish_year ?? 2024,
    subjectSlug,
    grade: GRADES[seed % GRADES.length]!,
    category: t("category.studyBite"),
    synopsis: t("synopsis", { subject: subjectName, title: work.title }),
    cover: work.cover_id
      ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg`
      : undefined,
    priceEur: seed % 3 === 0 ? Number((1.9 + (seed % 5)).toFixed(2)) : undefined,
    cards: synthCards(id, work.title, subjectName, t),
  };
}

async function fetchSubject(subjectSlug: string, t: Translator): Promise<Studybook[]> {
  const olSubject = OL_SUBJECT[subjectSlug] ?? "science";
  const subjectName = t(`subject.${subjectSlug}`);
  try {
    const res = await fetch(
      `https://openlibrary.org/subjects/${olSubject}.json?limit=${PER_SUBJECT}`,
      { next: { revalidate: 60 * 60 * 24 } }, // cache a day; it's dummy data
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { works?: OLWork[] };
    return (data.works ?? [])
      .map((w) => mapWork(w, subjectSlug, subjectName, t))
      .filter((b): b is Studybook => b !== null);
  } catch {
    return [];
  }
}

const cache = new Map<Locale, Promise<Studybook[]>>();

/** The full dummy catalog for a locale (memoized). Falls back to local mock if OL is down. */
export function getOpenLibraryCatalog(locale: Locale): Promise<Studybook[]> {
  let hit = cache.get(locale);
  if (!hit) {
    hit = (async () => {
      const t = await getTranslations({ locale, namespace: "catalog" });
      const batches = await Promise.all(SUBJECTS.map((s) => fetchSubject(s.slug, t)));
      const books = batches.flat();
      // Guard against duplicate slugs (same work under multiple subjects).
      const seen = new Set<string>();
      const unique = books.filter((b) => (seen.has(b.slug) ? false : seen.add(b.slug)));
      return unique.length > 0 ? unique : MOCK_STUDYBOOKS;
    })().catch(() => MOCK_STUDYBOOKS);
    cache.set(locale, hit);
  }
  return hit;
}

/** Best-effort map an OL work's subjects back to one of our subject slugs. */
function matchSubject(subjects?: string[]): string {
  if (subjects?.length) {
    const hay = subjects.join(" ").toLowerCase();
    for (const [slug, olSubject] of Object.entries(OL_SUBJECT)) {
      if (hay.includes(olSubject)) return slug;
    }
  }
  return "literature";
}

/** Fetch a single OL work by id (parsed from the slug) and map it to a Studybook. */
async function fetchWork(olId: string, t: Translator): Promise<Studybook | undefined> {
  try {
    const res = await fetch(`https://openlibrary.org/works/${olId}.json`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return undefined;
    const w = (await res.json()) as {
      title?: string;
      covers?: number[];
      description?: string | { value?: string };
      authors?: { author?: { key?: string } }[];
      subjects?: string[];
    };
    if (!w.title) return undefined;

    const id = `ol_${olId}`;
    const seed = hash(olId);
    const subjectSlug = matchSubject(w.subjects);

    // Resolve the first author's name (one extra request).
    let author = t("unknownAuthor");
    const authorKey = w.authors?.[0]?.author?.key;
    if (authorKey) {
      try {
        const ar = await fetch(`https://openlibrary.org${authorKey}.json`, {
          next: { revalidate: 60 * 60 * 24 },
        });
        if (ar.ok) {
          const aj = (await ar.json()) as { name?: string };
          if (aj.name) author = aj.name;
        }
      } catch {
        /* keep default */
      }
    }

    return {
      id,
      slug: `${slugify(w.title)}-${olId.toLowerCase()}`,
      title: w.title,
      author,
      year: 2024,
      subjectSlug,
      grade: GRADES[seed % GRADES.length]!,
      category: t("category.studyBite"),
      // Use the localized template (not OL's English description) so detail
      // pages are fully translated too.
      synopsis: t("synopsisPlain", { title: w.title }),
      cover: w.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${w.covers[0]}-M.jpg`
        : undefined,
      priceEur: seed % 3 === 0 ? Number((1.9 + (seed % 5)).toFixed(2)) : undefined,
      cards: synthCards(id, w.title, t(`subject.${subjectSlug}`), t),
    };
  } catch {
    return undefined;
  }
}

/**
 * Resolve a studybook by slug. Fast path uses the catalog; if the volatile OL
 * catalog doesn't contain it this request, we fetch the exact work by the OL id
 * embedded in the slug (…-olXXXXw) so detail links never 404.
 */
export async function getOpenLibraryStudybook(slug: string, locale: Locale): Promise<Studybook | undefined> {
  const hit = (await getOpenLibraryCatalog(locale)).find((b) => b.slug === slug);
  if (hit) return hit;

  const m = slug.match(/-(ol\d+w)$/i);
  if (!m) return undefined;
  const t = await getTranslations({ locale, namespace: "catalog" });
  return fetchWork(m[1]!.toUpperCase(), t);
}
