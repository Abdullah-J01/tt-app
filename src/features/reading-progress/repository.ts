
/**
 * One studybook's reading position. Carries a metadata snapshot — same reason
 * as LibraryEntry (src/features/library/useLibrary.ts): Home's Continue
 * section renders straight from this, no catalog re-fetch/lookup needed.
 */
export interface ProgressEntry {
  chapterIndex: number;
  cardIndex: number;
  globalIndex: number;
  totalCards: number;
  bookTitle: string;
  bookAuthor: string;
  subject: string;
  grade: string;
  cover?: string;
  updatedAt: number;
}

export type ProgressMap = Record<string, ProgressEntry>;

export async function getProgress(
  userEmail: string,
): Promise<{ configured: false } | { configured: true; progress: ProgressMap }> {
  void userEmail;
  return { configured: false };
}

export async function saveProgress(
  userEmail: string,
  studybookSlug: string,
  entry: ProgressEntry,
): Promise<{ configured: boolean }> {
  void userEmail;
  void studybookSlug;
  void entry;
  return { configured: false };
}
