/** Domain types shared across the app. TT API responses are mapped to these in src/lib/tt-api.ts. */

export interface StudyCard {
  id: string;
  /** One-line insight (the "bite"). */
  heading: string;
  /** 2–4 short supporting lines. */
  body: string;
}

export interface Studybook {
  id: string;
  slug: string;
  title: string;
  author: string;
  year: number;
  subjectSlug: string;
  grade: string;
  category: string;
  synopsis: string;
  /** Path/URL to cover art. */
  cover?: string;
  /** Price in EUR to unlock, if gated. */
  priceEur?: number;
  cards: StudyCard[];
}
