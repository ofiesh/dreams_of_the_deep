import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { s3Loader } from './lib/s3-loader';

const contentBucket = import.meta.env.CONTENT_BUCKET;

const books = defineCollection({
  loader: contentBucket
    ? s3Loader({ bucket: contentBucket })
    : glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    chapter: z.number(),
    pov: z.string().optional(),
    book: z.string(),
    status: z.enum(['draft', 'published']),
    publishDate: z.coerce.date().optional(),
    summary: z.string().optional(),
  }),
});

export const collections = { books };
