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
  {
    id: "sb_3",
    slug: "shapes-you-can-hold",
    title: "Shapes You Can Hold: Circle, Triangle, Cube",
    author: "Maurus",
    year: 2026,
    subjectSlug: "math",
    grade: "1-3",
    category: "Study bite",
    synopsis:
      "Meet flat shapes (circle, triangle, square) and solid ones (sphere, cube), then measure everyday objects with simple units.",
    priceEur: 1.9,
    cards: [
      {
        id: "c_6",
        heading: "A shape is a promise about edges.",
        body: "Count the sides and corners before you name it. A triangle keeps its promise: three of each.",
      },
    ],
  },
  {
    id: "sb_4",
    slug: "how-estonia-defends-itself",
    title: "How Does Estonia Defend Itself?",
    author: "Bite",
    year: 2026,
    subjectSlug: "history",
    grade: "gymnasium",
    category: "Study bite",
    synopsis:
      "Understand national defence: who protects the country, the main security threats, and why defence is not only the army's job.",
    priceEur: 3.9,
    cards: [
      {
        id: "c_7",
        heading: "Defence is everyone's job.",
        body: "Total defence means civilians, institutions and the military all have a role — not just soldiers.",
      },
    ],
  },
  {
    id: "sb_5",
    slug: "reading-city-simplified-texts",
    title: "Reading City: Simplified Texts for Grade 3",
    author: "Maurus",
    year: 2026,
    subjectSlug: "estonian",
    grade: "1-3",
    category: "Educational literature",
    synopsis:
      "Short, simplified stories that build reading confidence one page at a time — designed for early readers.",
    priceEur: 6.9,
    cards: [
      {
        id: "c_8",
        heading: "Confidence compounds.",
        body: "Each finished page makes the next one easier. Momentum, not length, is what keeps a young reader going.",
      },
    ],
  },
  {
    id: "sb_6",
    slug: "estonian-religious-landscape",
    title: "Estonia's Religious Landscape",
    author: "Maurus",
    year: 2026,
    subjectSlug: "history",
    grade: "gymnasium",
    category: "Educational literature",
    synopsis:
      "A gymnasium-level survey of the beliefs and traditions that shaped Estonia — from folk religion to modern pluralism.",
    priceEur: 6.9,
    cards: [
      {
        id: "c_9",
        heading: "Belief leaves marks on the map.",
        body: "Place names, holidays and buildings all carry traces of what people once held sacred.",
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
