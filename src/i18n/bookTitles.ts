import { type Locale } from "./config";

/**
 * Curated Estonian titles for the classic books the placeholder catalog pulls
 * from Open Library. Keyed by the lowercased English title. Anything not listed
 * keeps its English title (author names are identical in Estonian's Latin
 * script). This is demo-only — the real TaskuTark API will return localized
 * titles directly.
 */
const ET: Record<string, string> = {
  "pride and prejudice": "Uhkus ja eelarvamus",
  "alice's adventures in wonderland": "Alice Imedemaal",
  "alice in wonderland": "Alice Imedemaal",
  "through the looking-glass": "Peeglitagune maailm",
  "a christmas carol": "Jõululaul",
  "the picture of dorian gray": "Dorian Gray portree",
  "adventures of huckleberry finn": "Huckleberry Finni seiklused",
  "the adventures of huckleberry finn": "Huckleberry Finni seiklused",
  "the adventures of tom sawyer": "Tom Sawyeri seiklused",
  "adventures of tom sawyer": "Tom Sawyeri seiklused",
  "great expectations": "Suured lootused",
  "oliver twist": "Oliver Twist",
  "a tale of two cities": "Lugu kahest linnast",
  "robinson crusoe": "Robinson Crusoe",
  "treasure island": "Aarete saar",
  "little women": "Väikesed naised",
  "the scarlet letter": "Sarlakpunane täht",
  "war and peace": "Sõda ja rahu",
  "crime and punishment": "Kuritöö ja karistus",
  "anna karenina": "Anna Karenina",
  "the brothers karamazov": "Vennad Karamazovid",
  "jane eyre": "Jane Eyre",
  "wuthering heights": "Vihurimäe",
  "moby dick": "Moby Dick",
  "frankenstein": "Frankenstein",
  dracula: "Dracula",
  "the odyssey": "Odüsseia",
  "the iliad": "Ilias",
  "don quixote": "Don Quijote",
  "les misérables": "Hüljatud",
  "the great gatsby": "Suur Gatsby",
  emma: "Emma",
  "sense and sensibility": "Mõistus ja tunded",
  hamlet: "Hamlet",
  "romeo and juliet": "Romeo ja Julia",
  "the adventures of sherlock holmes": "Sherlock Holmesi seiklused",
  "gulliver's travels": "Gulliveri reisid",
  "the call of the wild": "Metsiku hääl",
  "the jungle book": "Džungliraamat",
  "peter pan": "Peeter Paan",
  "the wonderful wizard of oz": "Võlur Oz",
};

const MAPS: Partial<Record<Locale, Record<string, string>>> = { et: ET };

/** Localize a book title if a curated translation exists; else return as-is. */
export function localizeTitle(title: string, locale: Locale): string {
  const map = MAPS[locale];
  if (!map) return title;
  return map[title.trim().toLowerCase()] ?? title;
}
