import {
  getPublishedChapters as fetchPublished,
  getAllChapters as fetchAll,
  type ChapterEntry,
} from './content-service';

const NUM_WORDS = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
  'Twenty-One', 'Twenty-Two', 'Twenty-Three', 'Twenty-Four', 'Twenty-Five', 'Twenty-Six', 'Twenty-Seven', 'Twenty-Eight', 'Twenty-Nine', 'Thirty',
  'Thirty-One', 'Thirty-Two', 'Thirty-Three', 'Thirty-Four', 'Thirty-Five', 'Thirty-Six', 'Thirty-Seven', 'Thirty-Eight', 'Thirty-Nine', 'Forty',
];

export function chapterNumberWord(num: number): string {
  return NUM_WORDS[num] || String(num);
}

export function chapterLabel(num: number): string {
  if (num === 0) return 'Prologue';
  return `Chapter ${chapterNumberWord(num)}`;
}

/** Get all published chapters for a book, sorted by chapter number. */
export async function getPublishedChapters(bookSlug: string): Promise<ChapterEntry[]> {
  return fetchPublished(bookSlug);
}

/** Get all chapters (including drafts) for a book, sorted by chapter number. */
export async function getAllChapters(bookSlug: string): Promise<ChapterEntry[]> {
  return fetchAll(bookSlug);
}
