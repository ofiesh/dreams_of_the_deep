import { e as createComponent, m as maybeRenderHead, r as renderTemplate, k as renderComponent, h as createAstro, o as renderSlot } from './astro/server_BuE53ar_.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from './BaseLayout_CzWu0NDb.mjs';
/* empty css                             */
import 'clsx';
import * as z from 'zod';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import remarkSmartypants from 'remark-smartypants';

const $$ProgressBar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="progress-bar" class="progress-bar"></div>`;
}, "C:/Users/Nathanial/code2/dreams_of_the_deep/src/components/ProgressBar.astro", void 0);

const $$Astro = createAstro();
const $$ReaderLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ReaderLayout;
  const { title, description } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ProgressBar", $$ProgressBar, {})} ${renderSlot($$result2, $$slots["default"])} ${maybeRenderHead()}<footer class="site-footer">Dreams of the Deep</footer> ` })}`;
}, "C:/Users/Nathanial/code2/dreams_of_the_deep/src/layouts/ReaderLayout.astro", void 0);

/** Remove top-level `# heading` — title comes from frontmatter. */
function remarkStripTitle() {
  return (tree) => {
    visit(tree, 'heading', (node, index, parent) => {
      if (node.depth === 1 && parent && index != null) {
        parent.children.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
  };
}

/** Replace `---` thematic breaks with centered middle-dot dividers. */
function remarkSectionBreaks() {
  return (tree) => {
    visit(tree, 'thematicBreak', (node, index, parent) => {
      if (parent && index != null) {
        parent.children[index] = {
          type: 'html',
          value: '<div class="section-break" aria-hidden="true">\u00B7\u2002\u00B7\u2002\u00B7</div>',
        };
      }
    });
  };
}

/**
 * Style blockquotes as epigraphs with the `epigraph` class.
 * Attribution lines (paragraphs starting with em-dash) get `epigraph-source`.
 */
function remarkEpigraph() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties.className = ['epigraph'];

      // Check individual paragraphs for attribution lines
      for (const child of node.children) {
        if (child.type !== 'paragraph') continue;
        const text = getTextContent(child.children).trim();
        if (text.startsWith('\u2014') || text.startsWith('—')) {
          child.data = child.data || {};
          child.data.hProperties = child.data.hProperties || {};
          child.data.hProperties.className = ['epigraph-source'];
        }
      }
    });
  };
}

function getTextContent(nodes) {
  let text = '';
  for (const node of nodes) {
    if (node.type === 'text') text += node.value;
    else if (node.children) text += getTextContent(node.children);
  }
  return text;
}

/**
 * Fully-italic paragraphs (wrapped in single `*...*`) get the `scripture` class.
 * These are standalone italic blocks used for in-world scripture/fragment passages.
 */
function remarkScripture() {
  return (tree) => {
    visit(tree, 'paragraph', (node) => {
      // A "scripture" paragraph has exactly one child that is an emphasis node
      if (node.children.length === 1 && node.children[0].type === 'emphasis') {
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        node.data.hProperties.className = ['scripture'];
      }
    });
  };
}

const processor = unified().use(remarkParse).use(remarkStripTitle).use(remarkSectionBreaks).use(remarkEpigraph).use(remarkScripture).use(remarkSmartypants).use(remarkRehype, { allowDangerousHtml: true }).use(rehypeStringify, { allowDangerousHtml: true });
async function renderMarkdown(markdown) {
  const result = await processor.process(markdown);
  return String(result);
}

const chapterSchema = z.object({
  title: z.string(),
  chapter: z.number(),
  pov: z.string().optional(),
  book: z.string(),
  status: z.enum(["draft", "published"]),
  publishDate: z.coerce.date().optional(),
  summary: z.string().optional()
});
const cache = /* @__PURE__ */ new Map();
const listCache = /* @__PURE__ */ new Map();
const CACHE_TTL = 5 * 60 * 1e3;
function isFresh(ts) {
  return Date.now() - ts < CACHE_TTL;
}
function s3Provider(bucket) {
  let clientPromise = null;
  function getClient() {
    if (!clientPromise) clientPromise = import('@aws-sdk/client-s3');
    return clientPromise;
  }
  return {
    async readFile(key) {
      const { S3Client, GetObjectCommand } = await getClient();
      const client = new S3Client({ region: "us-east-2" });
      try {
        const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        return await result.Body.transformToString("utf-8");
      } catch (e) {
        if (e.name === "NoSuchKey" || e.$metadata?.httpStatusCode === 404) return null;
        throw e;
      }
    },
    async listFiles(prefix) {
      const { S3Client, ListObjectsV2Command } = await getClient();
      const client = new S3Client({ region: "us-east-2" });
      const keys = [];
      let token;
      do {
        const result = await client.send(
          new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token })
        );
        for (const obj of result.Contents ?? []) {
          if (obj.Key?.endsWith(".md")) keys.push(obj.Key);
        }
        token = result.NextContinuationToken;
      } while (token);
      return keys;
    }
  };
}
function localProvider() {
  return {
    async readFile(key) {
      const { readFile } = await import('node:fs/promises');
      const { join } = await import('node:path');
      const filePath = join(process.cwd(), "src", "content", "books", key);
      try {
        return await readFile(filePath, "utf-8");
      } catch {
        return null;
      }
    },
    async listFiles(prefix) {
      const { readdir } = await import('node:fs/promises');
      const { join } = await import('node:path');
      const dir = join(process.cwd(), "src", "content", "books", prefix);
      try {
        const files = await readdir(dir);
        return files.filter((f) => f.endsWith(".md")).map((f) => `${prefix}/${f}`);
      } catch {
        return [];
      }
    }
  };
}
let _provider = null;
function getProvider() {
  if (!_provider) {
    const bucket = process.env.CONTENT_BUCKET;
    _provider = bucket ? s3Provider(bucket) : localProvider();
  }
  return _provider;
}
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: raw };
  const yamlBlock = match[1];
  const content = match[2];
  const frontmatter = {};
  for (const line of yamlBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim();
    if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (typeof value === "string" && /^\d+$/.test(value)) {
      value = parseInt(value, 10);
    }
    frontmatter[key] = value;
  }
  return { frontmatter, content };
}
async function parseChapter(key, raw) {
  const { frontmatter, content } = parseFrontmatter(raw);
  const data = chapterSchema.parse(frontmatter);
  const html = await renderMarkdown(content);
  const slug = key.replace(/\.md$/, "").split("/").pop();
  const id = key.replace(/\.md$/, "");
  return { id, slug, data, html };
}
async function getChapter(bookSlug, chapterSlug) {
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
async function listChapters(bookSlug) {
  const cached = listCache.get(bookSlug);
  if (cached && isFresh(cached.ts)) return cached.entries;
  const provider = getProvider();
  const keys = await provider.listFiles(bookSlug);
  const entries = await Promise.all(
    keys.map(async (key) => {
      const raw = await provider.readFile(key);
      if (!raw) return null;
      const entry = await parseChapter(key, raw);
      cache.set(`${bookSlug}/${entry.slug}`, { entry, ts: Date.now() });
      return entry;
    })
  );
  const result = entries.filter((e) => e !== null).sort((a, b) => a.data.chapter - b.data.chapter);
  listCache.set(bookSlug, { entries: result, ts: Date.now() });
  return result;
}
async function getPublishedChapters$1(bookSlug) {
  const all = await listChapters(bookSlug);
  return all.filter((e) => e.data.status === "published");
}
async function getAllChapters$1(bookSlug) {
  return listChapters(bookSlug);
}

const NUM_WORDS = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
  "Twenty",
  "Twenty-One",
  "Twenty-Two",
  "Twenty-Three",
  "Twenty-Four",
  "Twenty-Five",
  "Twenty-Six",
  "Twenty-Seven",
  "Twenty-Eight",
  "Twenty-Nine",
  "Thirty",
  "Thirty-One",
  "Thirty-Two",
  "Thirty-Three",
  "Thirty-Four",
  "Thirty-Five",
  "Thirty-Six",
  "Thirty-Seven",
  "Thirty-Eight",
  "Thirty-Nine",
  "Forty"
];
function chapterNumberWord(num) {
  return NUM_WORDS[num] || String(num);
}
function chapterLabel(num) {
  if (num === 0) return "Prologue";
  return `Chapter ${chapterNumberWord(num)}`;
}
async function getPublishedChapters(bookSlug) {
  return getPublishedChapters$1(bookSlug);
}
async function getAllChapters(bookSlug) {
  return getAllChapters$1(bookSlug);
}

export { $$ReaderLayout as $, getAllChapters as a, getPublishedChapters as b, chapterLabel as c, getChapter as g };
