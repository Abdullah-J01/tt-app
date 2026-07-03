/**
 * Explore / catalog feature. Import everything Explore-related from here:
 *   import { ExploreView, SubjectCard, searchCatalog } from "@/features/explore";
 */
export { ExploreView } from "./components/ExploreView";
export { SubjectBooks } from "./components/SubjectBooks";
export { SearchBar } from "./components/SearchBar";
export { FilterPanel } from "./components/FilterPanel";
export { FilterDrawer } from "./components/FilterDrawer";
export { ActiveFilters } from "./components/ActiveFilters";
export { SubjectRail } from "./components/SubjectRail";
export { Pagination } from "@/components/ui/Pagination";
export { SortMenu, sortBooks, SORTS } from "./components/SortMenu";
export type { Sort } from "./components/SortMenu";
export { CoverCard } from "./components/CoverCard";
export { StudybiteCard } from "./components/StudybiteCard";
export { SubjectCard } from "./components/SubjectCard";

export { getCatalog, getFreshlyAdded, getPopular, getStudybites, searchCatalog } from "./data";
export type { Studybite, SearchResults } from "./data";

export { FACETS, GRADE_VALUES, applyFilters, createFilterPredicate, facetValues, optionLabel } from "./filters";
export type { Facet, FilterOption } from "./filters";
