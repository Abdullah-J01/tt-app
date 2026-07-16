/**
 * TaskuTark (TT) backend client.
 *
 * This app does NOT own a database — TT is the source of truth for all content
 * (subjects, studybooks, cards, feed, search) and, pending confirmation, for
 * user auth + engagement. See docs/TT_API_ENDPOINTS.md for the full contract.
 *
 * The DTO interfaces below are the *proposed* response shapes. Once TT confirms
 * their real shapes, adjust the DTOs + `map*` functions only — the rest of the
 * app consumes our own types from "@/types" and won't need to change.
 */
import type { Studybook, StudyCard } from "@/types";

const BASE = process.env.TT_API_BASE_URL;
const API_KEY = process.env.TT_API_KEY;

export class TTApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "TTApiError";
  }
}

async function ttFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) throw new TTApiError(0, "TT_API_BASE_URL is not configured");

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
      ...init?.headers,
    },
    // Content is cacheable; tune per-endpoint (feed/search should be shorter).
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new TTApiError(res.status, `TT API ${path} responded ${res.status}`);
  }
  return (await res.json()) as T;
}

// ─── Proposed DTOs (mirror docs/TT_API_ENDPOINTS.md) ───────────────
interface TTSubjectDTO {
  slug: string;
  name: string;
  itemCount: number;
  iconKey?: string;
}

interface TTCardDTO {
  id: string;
  order: number;
  heading: string;
  body: string;
  imageUrl?: string;
}

interface TTStudybookDTO {
  id: string;
  slug: string;
  title: string;
  author: string;
  year: number;
  subjectSlug: string;
  grade: string;
  category: string;
  synopsis: string;
  coverUrl?: string;
  priceCents?: number;
  cards?: TTCardDTO[];
}

// ─── Mappers: TT shape → our domain types ──────────────────────────
function mapCard(dto: TTCardDTO): StudyCard {
  return { id: dto.id, heading: dto.heading, body: dto.body };
}

function mapStudybook(dto: TTStudybookDTO): Studybook {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    author: dto.author,
    year: dto.year,
    subjectSlug: dto.subjectSlug,
    grade: dto.grade,
    category: dto.category,
    synopsis: dto.synopsis,
    cover: dto.coverUrl,
    priceEur: dto.priceCents != null ? dto.priceCents / 100 : undefined,
    cards: (dto.cards ?? []).slice().sort((a, b) => a.order - b.order).map(mapCard),
  };
}

// ─── Public methods ────────────────────────────────────────────────
export const ttApi = {
  async listSubjects(): Promise<{ slug: string; name: string; count: number; iconKey?: string }[]> {
    const data = await ttFetch<{ subjects: TTSubjectDTO[] }>("/v1/subjects");
    return data.subjects.map((s) => ({
      slug: s.slug,
      name: s.name,
      count: s.itemCount,
      iconKey: s.iconKey,
    }));
  },

  async listStudybooks(params?: {
    subject?: string;
    grade?: string;
    page?: number;
  }): Promise<Studybook[]> {
    const q = new URLSearchParams();
    if (params?.subject) q.set("subject", params.subject);
    if (params?.grade && params.grade !== "all") q.set("grade", params.grade);
    if (params?.page) q.set("page", String(params.page));
    const data = await ttFetch<{ studybooks: TTStudybookDTO[] }>(`/v1/studybooks?${q}`);
    return data.studybooks.map(mapStudybook);
  },

  async getStudybook(slug: string): Promise<Studybook> {
    // Expected to include ordered cards; if TT serves cards separately,
    // fetch /v1/studybooks/{slug}/cards here and merge.
    const data = await ttFetch<{ studybook: TTStudybookDTO }>(`/v1/studybooks/${slug}`);
    return mapStudybook(data.studybook);
  },

  async getForYouFeed(cursor?: string): Promise<Studybook[]> {
    const q = new URLSearchParams();
    if (cursor) q.set("cursor", cursor);
    const data = await ttFetch<{ studybooks: TTStudybookDTO[] }>(`/v1/feed?${q}`);
    return data.studybooks.map(mapStudybook);
  },

  /**
   * Catalogue search. `type` picks what the query matches against:
   *  - "studybook" — book-level text (title, author, synopsis…)
   *  - "bite"      — card-level text; returns the books carrying the matched
   *                  cards, which the caller flattens into bites.
   * TODO(team): confirm TT returns `{ studybooks }` for type=bite (and whether
   * it narrows `cards` to the matches) — the DTO below assumes it does.
   */
  async search(query: string, type: "studybook" | "bite" = "studybook"): Promise<Studybook[]> {
    const q = new URLSearchParams({ q: query, type });
    const data = await ttFetch<{ studybooks: TTStudybookDTO[] }>(`/v1/search?${q}`);
    return data.studybooks.map(mapStudybook);
  },
};
