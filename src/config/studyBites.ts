/**
 * Dummy "study bites" (õpiampsud) used on the landing page while the real
 * content API is wired up. Each entry drives one horizontal `ContentCard` in the
 * "New study bites" section. Replace with live data once TT exposes it.
 */
export interface StudyBite {
  /** Stable id — used as the React key and the detail link slug. */
  slug: string;
  title: string;
  /** Supporting copy — clamped to ~3 lines on the card. */
  description: string;
  /** Price in EUR, rendered as a "from X.XX€" pill. */
  priceEur: number;
  /** Category tag (leads with a globe icon), e.g. "Õpiamps". */
  category: string;
  /** Publisher tag, e.g. "Maurus". */
  publisher: string;
  /**
   * Cover image. Drop a file into `public/images/` and set the path here
   * (e.g. `"/images/nuputame-koos.png"`). Until then the card shows an
   * illustration placeholder, so partial data never breaks the layout.
   */
  image?: string;
}

export const STUDY_BITES: StudyBite[] = [
  {
    slug: "nuputame-koos-transpordivahendid",
    title: "NUPUTAME KOOS! Transpordivahendid",
    description:
      "Õpiamps „NUPUTAME KOOS! Transpordivahendid” kutsub 5–8-aastaseid lapsi nuputama, arvutama, võrdlema, järjestama ja tähelepanu arendama. Ampsu saab kasutada transpordivahendite teema õppimisel ja kordamisel.",
    priceEur: 1.9,
    category: "Õpiamps",
    publisher: "Maurus",
    image: "/images/demoData/demoImage1.jpg",
  },
  {
    slug: "kas-ja-kuidas-suudab-eesti-end-kaitsta",
    title: "Kas ja kuidas suudab Eesti end kaitsta?",
    description:
      "Õpiamps „Kas ja kuidas suudab Eesti end kaitsta?” aitab mõista, kuidas toimib Eesti riigikaitse, millised on peamised julgeolekuohud ning miks ei tähenda riigi kaitsmine üksnes sõjalist valmisolekut.",
    priceEur: 3.9,
    category: "Õpiamps",
    publisher: "Maurus",
    image: "/images/demoData/demoImage2.jpg",
  },
  {
    slug: "matemaatika-videotund-tekstulesanded",
    title: "Matemaatika videotund. Tekstülesanded",
    description:
      "Tekstülesannetel on koht nii põhikooli kui ka gümnaasiumi matemaatikas. Tekstülesanded aitavad meil igapäevaseid probleeme kirja panna matemaatika keeles ning seeläbi leida neile lahendusi.",
    priceEur: 5.9,
    category: "Õpiamps",
    publisher: "Maurus",
    image: "/images/demoData/demoImage3.jpg",
  },
  {
    slug: "vaike-matemaatik-kujundid",
    title: "Väike matemaatik: ring, kolmnurk, nelinurk, kera ja kuup",
    description:
      "Selles õpiampsus õpime tundma tasapinnalisi (ring, kolmnurk, nelinurk) ja ruumilisi kujundeid (kera, kuup) ning mõõdame tinglike mõõtühikute abil asjade pikkuseid ja suurusi.",
    priceEur: 1.9,
    category: "Õpiamps",
    publisher: "Maurus",
    image: "/images/demoData/demoImage4.jpg",
  },
];
