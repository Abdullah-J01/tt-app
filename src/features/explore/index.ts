/**
 * Explore / catalog feature. Import everything Explore-related from here:
 *   import { ExploreView, SubjectCard, searchCatalog } from "@/features/explore";
 */
export { ExploreView } from "./components/ExploreView";
export { SubjectBooks } from "./components/SubjectBooks";
export { SearchBar } from "./components/SearchBar";
export { FilterPanel } from "./components/FilterPanel";
export { CoverCard } from "./components/CoverCard";
export { StudybiteCard } from "./components/StudybiteCard";
export { SubjectCard } from "./components/SubjectCard";

export { getFreshlyAdded, getPopular, getStudybites, searchCatalog } from "./data";
export type { Studybite, SearchResults } from "./data";

export { FACETS } from "./filters";
export type { Facet, FilterOption } from "./filters";
