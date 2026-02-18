import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import type { Loader } from 'astro/loaders';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

interface S3LoaderOptions {
  bucket: string;
  region?: string;
}

/**
 * Astro 5 content loader that reads markdown files from an S3 bucket.
 *
 * Bucket structure expected:
 *   {book-slug}/prologue.md      (with YAML frontmatter)
 *   {book-slug}/chapter-01.md    (with YAML frontmatter)
 *   {book-slug}/cover.png
 *
 * Required frontmatter fields: title, chapter, book, status
 * Entry IDs match the glob loader format: "the-outer-tokens/chapter-01"
 */
export function s3Loader(options: S3LoaderOptions): Loader {
  const { bucket, region = 'us-east-2' } = options;

  return {
    name: 's3-loader',
    async load({ store, logger, parseData }) {
      const client = new S3Client({ region });

      logger.info(`Loading content from s3://${bucket}/`);

      let continuationToken: string | undefined;
      const mdFiles: { key: string; body: string }[] = [];

      const imageKeys: string[] = [];
      const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];

      // List all objects in the bucket
      do {
        const listCmd = new ListObjectsV2Command({
          Bucket: bucket,
          ContinuationToken: continuationToken,
        });
        const listResult = await client.send(listCmd);

        for (const obj of listResult.Contents ?? []) {
          const key = obj.Key!;
          if (key.endsWith('.md')) {
            const getCmd = new GetObjectCommand({ Bucket: bucket, Key: key });
            const result = await client.send(getCmd);
            const body = await result.Body!.transformToString('utf-8');
            mdFiles.push({ key, body });
          } else if (IMAGE_EXTS.some((ext) => key.toLowerCase().endsWith(ext))) {
            imageKeys.push(key);
          }
        }

        continuationToken = listResult.NextContinuationToken;
      } while (continuationToken);

      // Download images to public/images/ so they're available as static assets
      if (imageKeys.length > 0) {
        logger.info(`Downloading ${imageKeys.length} image(s) to public/images/`);
        await Promise.all(
          imageKeys.map(async (key) => {
            const getCmd = new GetObjectCommand({ Bucket: bucket, Key: key });
            const result = await client.send(getCmd);
            const bytes = await result.Body!.transformToByteArray();
            const dest = join('public', 'images', key);
            await mkdir(dirname(dest), { recursive: true });
            await writeFile(dest, bytes);
          }),
        );
      }

      logger.info(`Found ${mdFiles.length} markdown files`);

      store.clear();

      for (const file of mdFiles) {
        // key: "the-outer-tokens/chapter-01.md" → id: "the-outer-tokens/chapter-01"
        const id = file.key.replace(/\.md$/, '');

        // Split frontmatter from body
        const { frontmatter, content } = parseFrontmatter(file.body);

        const data = await parseData({
          id,
          data: frontmatter,
        });

        store.set({
          id,
          data,
          body: content,
        });
      }
    },
  };
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, content: raw };
  }

  const yamlBlock = match[1];
  const content = match[2];

  // Simple YAML parser for flat key-value frontmatter
  const frontmatter: Record<string, unknown> = {};
  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value: unknown = trimmed.slice(colonIdx + 1).trim();

    // Strip surrounding quotes
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    // Coerce numbers
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      value = parseInt(value, 10);
    }

    frontmatter[key] = value;
  }

  return { frontmatter, content };
}
