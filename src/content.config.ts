import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
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
