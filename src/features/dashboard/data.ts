/**
 * Data for the logged-in Home page. Popular/New are the same proxies Explore
 * already uses (src/features/explore/data.ts) — reused as-is, not reinvented.
 * Continue and Your Library depend on localStorage/session state, so they're
 * resolved client-side in HomeView instead.
 */
import { getFreshlyAdded, getPopular } from "@/features/explore/data";
import type { Studybook } from "@/types";

export interface HomeData {
  popular: Studybook[];
  freshlyAdded: Studybook[];
}

const RAIL_SIZE = 8;

export async function getHomeData(): Promise<HomeData> {
  const [popular, freshlyAdded] = await Promise.all([
    getPopular(RAIL_SIZE),
    getFreshlyAdded(RAIL_SIZE),
  ]);
  return { popular, freshlyAdded };
}
