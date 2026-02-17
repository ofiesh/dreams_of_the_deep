import { getCollection } from 'astro:content';

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
export async function getPublishedChapters(bookSlug: string) {
  const allEntries = await getCollection('books');
  return allEntries
    .filter((e) => e.data.book === bookSlug && e.data.status === 'published')
    .sort((a, b) => a.data.chapter - b.data.chapter);
}

/** Get all chapters (including drafts) for a book, sorted by chapter number. */
export async function getAllChapters(bookSlug: string) {
  const allEntries = await getCollection('books');
  return allEntries
    .filter((e) => e.data.book === bookSlug)
    .sort((a, b) => a.data.chapter - b.data.chapter);
}

/** Derive the URL slug from a collection entry's ID. */
export function chapterSlug(entry: { id: string }): string {
  // ID from glob loader is like "the-outer-tokens/chapter-01"
  // We want just "chapter-01" or "prologue"
  const parts = entry.id.split('/');
  return parts[parts.length - 1];
}
