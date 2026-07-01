import type { Studybook } from "@/types";

/**
 * TEMPORARY mock content so the UI renders before the API/DB exist.
 * Replace all usages with real data fetching (see src/lib/api.ts TODOs).
 */
export const MOCK_STUDYBOOKS: Studybook[] = [
  {
    id: "sb_1",
    slug: "a-very-serious-snowman-story",
    title: "A Very Serious Snowman Story",
    author: "Johanna Unt",
    year: 2026,
    subjectSlug: "estonian",
    grade: "4-6",
    category: "For children and youth",
    synopsis:
      "A small, boring town whose only pride is its snowy winters and its legendary snowman-building contest — until, for the first time in history, no winner can be declared.",
    priceEur: 1.9,
    cards: [
      {
        id: "c_1",
        heading: "A story is a promise to the reader.",
        body: "The opening sets an expectation. This town is 'so boring even the wind yawns' — a promise that something will break the routine.",
      },
      {
        id: "c_2",
        heading: "Conflict is just a plan meeting reality.",
        body: "The contest theme 'important people in history' collides with a winter that refuses to snow. No snow, no snowmen.",
      },
      {
        id: "c_3",
        heading: "Stakes make small things matter.",
        body: "For this town, a snowman contest is the event of the year. Scale is relative — raise the stakes inside the world you built.",
      },
    ],
  },
  {
    id: "sb_2",
    slug: "word-problems-that-click",
    title: "Word Problems That Click",
    author: "Maurus",
    year: 2026,
    subjectSlug: "math",
    grade: "7-9",
    category: "Study bite",
    synopsis:
      "Turn everyday situations into math you can actually solve. A short, practical set of cards on translating word problems into equations.",
    priceEur: 5.9,
    cards: [
      {
        id: "c_4",
        heading: "Name the unknown first.",
        body: "Before anything else, decide what x stands for. Half of word problems are solved the moment you label the unknown.",
      },
      {
        id: "c_5",
        heading: "Translate one clause at a time.",
        body: "'Three more than twice a number' → 2x + 3. Convert phrases into symbols piece by piece; don't swallow the sentence whole.",
      },
    ],
  },
];

export function getStudybookBySlug(slug: string): Studybook | undefined {
  return MOCK_STUDYBOOKS.find((b) => b.slug === slug);
}

/** Flattened "For You" feed: cards interleaved from multiple studybooks. */
export function getForYouFeed() {
  return MOCK_STUDYBOOKS.flatMap((book) =>
    book.cards.map((card, index) => ({
      card,
      book,
      index,
      total: book.cards.length,
    })),
  );
}
