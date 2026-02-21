import { z } from 'zod';
import { renderMarkdown } from './render-markdown';

// Book metadata schema
const bookMetaSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  coverImage: z.string(),
  accentColor: z.string(),
  status: z.enum(['active', 'coming-soon']),
  sortOrder: z.number(),
});

export type BookMeta = z.infer<typeof bookMetaSchema> & { slug: string };

// Same schema as the old content.config.ts
const chapterSchema = z.object({
  title: z.string(),
  chapter: z.number(),
  pov: z.string().optional(),
  book: z.string().optional(),
  status: z.enum(['draft', 'published']),
  publishDate: z.coerce.date().optional(),
  summary: z.string().optional(),
});

export type ChapterData = z.infer<typeof chapterSchema>;

export interface ChapterEntry {
  id: string;
  slug: string;
  data: ChapterData;
  html: string;
}

// In-memory cache: key → { entry, timestamp }
const cache = new Map<string, { entry: ChapterEntry; ts: number }>();
const listCache = new Map<string, { entries: ChapterEntry[]; ts: number }>();
const bookMetaCache = new Map<string, { meta: BookMeta; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isFresh(ts: number): boolean {
  return Date.now() - ts < CACHE_TTL;
}

// --- Provider interface ---

interface ContentProvider {
  readFile(key: string): Promise<string | null>;
  listFiles(prefix: string): Promise<string[]>;
}

// --- S3 Provider ---

function s3Provider(bucket: string): ContentProvider {
  // Lazy-import to avoid loading AWS SDK in dev
  let clientPromise: Promise<typeof import('@aws-sdk/client-s3')> | null = null;
  function getClient() {
    if (!clientPromise) clientPromise = import('@aws-sdk/client-s3');
    return clientPromise;
  }

  return {
    async readFile(key: string): Promise<string | null> {
      const { S3Client, GetObjectCommand } = await getClient();
      const client = new S3Client({ region: 'us-east-2' });
      try {
        const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        return await result.Body!.transformToString('utf-8');
      } catch (e: any) {
        if (e.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404) return null;
        throw e;
      }
    },
    async listFiles(prefix: string): Promise<string[]> {
      const { S3Client, ListObjectsV2Command } = await getClient();
      const client = new S3Client({ region: 'us-east-2' });
      const keys: string[] = [];
      let token: string | undefined;
      do {
        const result = await client.send(
          new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token })
        );
        for (const obj of result.Contents ?? []) {
          if (obj.Key?.endsWith('.md')) keys.push(obj.Key);
        }
        token = result.NextContinuationToken;
      } while (token);
      return keys;
    },
  };
}

// --- Local file provider ---

function localProvider(): ContentProvider {
  return {
    async readFile(key: string): Promise<string | null> {
      const { readFile } = await import('node:fs/promises');
      const { join } = await import('node:path');
      const filePath = join(process.cwd(), 'src', 'content', 'books', key);
      try {
        return await readFile(filePath, 'utf-8');
      } catch {
        return null;
      }
    },
    async listFiles(prefix: string): Promise<string[]> {
      const { readdir } = await import('node:fs/promises');
      const { join } = await import('node:path');
      const dir = join(process.cwd(), 'src', 'content', 'books', prefix);
      try {
        const files = await readdir(dir);
        return files.filter((f) => f.endsWith('.md')).map((f) => `${prefix}/${f}`);
      } catch {
        return [];
      }
    },
  };
}

// --- Get provider based on environment ---

let _provider: ContentProvider | null = null;
function getProvider(): ContentProvider {
  if (!_provider) {
    const bucket = process.env.CONTENT_BUCKET;
    _provider = bucket ? s3Provider(bucket) : localProvider();
  }
  return _provider;
}

// --- Frontmatter parser (reused from s3-loader.ts) ---

function parseFrontmatter(raw: string): { frontmatter: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: raw };

  const yamlBlock = match[1];
  const content = match[2];

  const frontmatter: Record<string, unknown> = {};
  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value: unknown = trimmed.slice(colonIdx + 1).trim();

    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      value = parseInt(value, 10);
    }

    frontmatter[key] = value;
  }

  return { frontmatter, content };
}

async function parseChapter(key: string, raw: string): Promise<ChapterEntry> {
  const { frontmatter, content } = parseFrontmatter(raw);
  const data = chapterSchema.parse(frontmatter);
  const html = await renderMarkdown(content);
  // key: "the-outer-tokens/chapter-01.md" → slug: "chapter-01"
  const slug = key.replace(/\.md$/, '').split('/').pop()!;
  const id = key.replace(/\.md$/, '');
  return { id, slug, data, html };
}

// --- Public API ---

export async function getChapter(bookSlug: string, chapterSlug: string): Promise<ChapterEntry | null> {
  const cacheKey = `${bookSlug}/${chapterSlug}`;
  const cached = cache.get(cacheKey);
  if (cached && isFresh(cached.ts)) return cached.entry;

  const provider = getProvider();
  const raw = await provider.readFile(`${bookSlug}/${chapterSlug}.md`);
  if (!raw) return null;

  const entry = await parseChapter(`${bookSlug}/${chapterSlug}.md`, raw);
  cache.set(cacheKey, { entry, ts: Date.now() });
  return entry;
}

export async function listChapters(bookSlug: string): Promise<ChapterEntry[]> {
  const cached = listCache.get(bookSlug);
  if (cached && isFresh(cached.ts)) return cached.entries;

  const provider = getProvider();
  const keys = await provider.listFiles(bookSlug);

  const entries = await Promise.all(
    keys.map(async (key) => {
      const raw = await provider.readFile(key);
      if (!raw) return null;
      try {
        const entry = await parseChapter(key, raw);
        // Also populate per-chapter cache
        cache.set(`${bookSlug}/${entry.slug}`, { entry, ts: Date.now() });
        return entry;
      } catch (err) {
        console.warn(`[content] Skipping ${key}: ${err instanceof Error ? err.message : err}`);
        return null;
      }
    })
  );

  const result = entries.filter((e): e is ChapterEntry => e !== null)
    .sort((a, b) => a.data.chapter - b.data.chapter);

  listCache.set(bookSlug, { entries: result, ts: Date.now() });
  return result;
}

export async function getPublishedChapters(bookSlug: string): Promise<ChapterEntry[]> {
  const all = await listChapters(bookSlug);
  return all.filter((e) => e.data.status === 'published');
}

export async function getAllChapters(bookSlug: string): Promise<ChapterEntry[]> {
  return listChapters(bookSlug);
}

// --- Book metadata API ---

export async function getBookMeta(bookSlug: string): Promise<BookMeta | null> {
  const cached = bookMetaCache.get(bookSlug);
  if (cached && isFresh(cached.ts)) return cached.meta;

  const provider = getProvider();
  const raw = await provider.readFile(`${bookSlug}/book.json`);
  if (!raw) return null;

  try {
    const parsed = bookMetaSchema.parse(JSON.parse(raw));
    const meta: BookMeta = { ...parsed, slug: bookSlug };
    bookMetaCache.set(bookSlug, { meta, ts: Date.now() });
    return meta;
  } catch {
    return null;
  }
}

export async function listBooks(): Promise<BookMeta[]> {
  const provider = getProvider();
  const raw = await provider.readFile('books.json');
  if (!raw) return [];

  let slugs: string[];
  try {
    slugs = JSON.parse(raw);
  } catch {
    return [];
  }

  const books = await Promise.all(slugs.map((slug) => getBookMeta(slug)));
  return books
    .filter((b): b is BookMeta => b !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export interface RecentChapter {
  slug: string;
  title: string;
  chapter: number;
  publishDate: Date;
  bookSlug: string;
  bookTitle: string;
}

export async function getRecentChapters(limit = 5): Promise<RecentChapter[]> {
  const books = await listBooks();
  const allChapters: RecentChapter[] = [];

  for (const book of books) {
    const chapters = await getPublishedChapters(book.slug);
    for (const ch of chapters) {
      if (ch.data.publishDate) {
        allChapters.push({
          slug: ch.slug,
          title: ch.data.title,
          chapter: ch.data.chapter,
          publishDate: ch.data.publishDate,
          bookSlug: book.slug,
          bookTitle: book.title,
        });
      }
    }
  }

  allChapters.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
  return allChapters.slice(0, limit);
}
