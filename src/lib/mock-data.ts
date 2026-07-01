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
    slug: "everyday-astronomy",
    title: "Everyday Astronomy",
    author: "R. Tamm",
    year: 2024,
    subjectSlug: "physics",
    grade: "7-9",
    category: "Study bite",
    synopsis:
      "Twenty-four bite-sized cards that turn the night sky into everyday intuition — from why stars twinkle to how far light really travels.",
    cards: [
      {
        id: "c_6",
        heading: "Why stars twinkle",
        body: "Starlight passes through pockets of moving air at different temperatures. Each pocket bends the light a little differently, so the star seems to shimmer.",
      },
      {
        id: "c_7",
        heading: "The 8-minute sunbeam",
        body: "Sunlight takes about 8 minutes to reach us. The sunrise you see already happened — you're looking slightly into the past.",
      },
      {
        id: "c_8",
        heading: "The Moon illusion",
        body: "The Moon looks bigger near the horizon, but it isn't. Your brain compares it to trees and buildings and overestimates its size.",
      },
      {
        id: "c_9",
        heading: "Why the sky is blue",
        body: "Short blue wavelengths scatter across the sky far more than red ones, so the daytime sky glows blue in every direction.",
      },
    ],
  },
  {
    id: "sb_14",
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
        id: "c_22",
        heading: "A shape is a promise about edges.",
        body: "Count the sides and corners before you name it. A triangle keeps its promise: three of each.",
      },
    ],
  },
  {
    id: "sb_4",
    slug: "forces-and-motion",
    title: "Forces & Motion",
    author: "J. Mets",
    year: 2024,
    subjectSlug: "physics",
    grade: "7-9",
    category: "Study bite",
    synopsis:
      "Pushes, pulls and the rules they obey. A quick tour of the ideas behind why things speed up, slow down and stay put.",
    cards: [
      {
        id: "c_10",
        heading: "Things keep doing what they're doing",
        body: "Without a force, motion doesn't change. A puck on frictionless ice would slide forever — inertia is the default, not stopping.",
      },
      {
        id: "c_11",
        heading: "Heavier things need more push",
        body: "The same force moves a light cart quickly and a heavy one slowly. Acceleration is force shared out over mass.",
      },
    ],
  },
  {
    id: "sb_15",
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
        id: "c_24",
        heading: "Defence is everyone's job.",
        body: "Total defence means civilians, institutions and the military all have a role — not just soldiers.",
      },
    ],
  },
  {
    id: "sb_5",
    slug: "light-and-colour",
    title: "Light & Colour",
    author: "H. Pais",
    year: 2023,
    subjectSlug: "physics",
    grade: "4-6",
    category: "Study bite",
    synopsis:
      "Where colour comes from and why the world looks the way it does — rainbows, mixing light, and the colours our eyes invent.",
    cards: [
      {
        id: "c_12",
        heading: "White light is a bundle of colours",
        body: "A prism spreads sunlight into a rainbow because each colour bends by a slightly different amount.",
      },
    ],
  },
  {
    id: "sb_16",
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
        id: "c_23",
        heading: "Confidence compounds.",
        body: "Each finished page makes the next one easier. Momentum, not length, is what keeps a young reader going.",
      },
    ],
  },
  {
    id: "sb_6",
    slug: "energy-basics",
    title: "Energy Basics",
    author: "T. Kask",
    year: 2023,
    subjectSlug: "physics",
    grade: "7-9",
    category: "Study bite",
    synopsis:
      "Energy never disappears — it just changes form. A short set on where energy goes and how we keep track of it.",
    cards: [
      {
        id: "c_13",
        heading: "Energy is never lost, only moved",
        body: "A swinging pendulum trades height for speed and back again. The total stays the same; only its form changes.",
      },
    ],
  },
  {
    id: "sb_7",
    slug: "how-plants-eat-light",
    title: "How Plants Eat Light",
    author: "A. Lepp",
    year: 2025,
    subjectSlug: "biology",
    grade: "4-6",
    category: "Study bite",
    synopsis:
      "Photosynthesis, made simple. How a leaf turns sunlight, air and water into food — and why that quietly powers almost everything alive.",
    cards: [
      {
        id: "c_14",
        heading: "A leaf is a tiny solar panel",
        body: "Chlorophyll traps sunlight, air and water and builds sugar — the plant's food. This is photosynthesis, the start of nearly every food chain.",
      },
      {
        id: "c_15",
        heading: "Why leaves turn red",
        body: "As green chlorophyll fades in autumn, hidden pigments show through — reds and yellows that were there all along.",
      },
    ],
  },
  {
    id: "sb_8",
    slug: "the-green-planet",
    title: "The Green Planet",
    author: "M. Karu",
    year: 2025,
    subjectSlug: "biology",
    grade: "7-9",
    category: "Study bite",
    synopsis:
      "Plants run the planet. From photosynthesis to forests that breathe, a short look at the green machinery keeping the air fresh.",
    cards: [
      {
        id: "c_16",
        heading: "Forests breathe out the air we breathe in",
        body: "Through photosynthesis, plants release the oxygen animals need. The 'lungs of the planet' aren't a metaphor — they're chemistry.",
      },
    ],
  },
  {
    id: "sb_9",
    slug: "the-human-body",
    title: "The Human Body",
    author: "M. Karu",
    year: 2024,
    subjectSlug: "biology",
    grade: "4-6",
    category: "Study bite",
    synopsis:
      "A friendly field guide to the body you live in — what the parts do and how they quietly keep you running all day.",
    cards: [
      {
        id: "c_17",
        heading: "Your heart is a lifelong pump",
        body: "It beats around 100,000 times a day, pushing blood through a network of vessels long enough to wrap the Earth twice.",
      },
    ],
  },
  {
    id: "sb_10",
    slug: "wild-weather",
    title: "Wild Weather",
    author: "L. Saar",
    year: 2025,
    subjectSlug: "geography",
    grade: "4-6",
    category: "Study bite",
    synopsis:
      "Storms, clouds and the water cycle — the everyday drama of the sky explained in quick, memorable cards.",
    cards: [
      {
        id: "c_18",
        heading: "The water cycle never stops",
        body: "Water evaporates, forms clouds, falls as rain, and flows back to the sea — the same water, recycled for billions of years.",
      },
    ],
  },
  {
    id: "sb_11",
    slug: "ancient-rome",
    title: "Ancient Rome",
    author: "T. Org",
    year: 2023,
    subjectSlug: "history",
    grade: "7-9",
    category: "Study bite",
    synopsis:
      "From a small city to an empire that shaped law, language and roads still under our feet. Rome in bite-sized turning points.",
    cards: [
      {
        id: "c_19",
        heading: "All roads really did lead to Rome",
        body: "A road network of over 400,000 km tied the empire together — some routes still trace the paths of modern highways.",
      },
    ],
  },
  {
    id: "sb_12",
    slug: "number-magic",
    title: "Number Magic",
    author: "P. Roos",
    year: 2024,
    subjectSlug: "math",
    grade: "1-3",
    category: "Study bite",
    synopsis:
      "The playful side of numbers — patterns, tricks and shortcuts that make arithmetic feel like sleight of hand.",
    cards: [
      {
        id: "c_20",
        heading: "The nines trick",
        body: "Multiply any number by 9 and its digits add up to 9 (or a multiple of it). A quick way to check your work.",
      },
    ],
  },
  {
    id: "sb_13",
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
        id: "c_21",
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
