import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { readingProgress } from '../../../lib/db/schema';
import { getUser } from '../../../lib/auth';
import { eq, and } from 'drizzle-orm';

export const prerender = false;

/** GET /api/progress/sync?book=the-outer-tokens — get all reading progress for a book */
export const GET: APIRoute = async ({ request }) => {
  const user = getUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const bookSlug = url.searchParams.get('book');
  if (!bookSlug) {
    return new Response(JSON.stringify({ error: 'book param required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rows = await db
    .select()
    .from(readingProgress)
    .where(
      and(
        eq(readingProgress.userId, user.userId),
        eq(readingProgress.bookSlug, bookSlug),
      ),
    );

  const chapters: Record<string, { scrollRatio: number; completed: boolean }> = {};
  for (const row of rows) {
    chapters[row.chapterSlug] = {
      scrollRatio: row.scrollRatio,
      completed: row.completed,
    };
  }

  return new Response(JSON.stringify({ chapters }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

/** POST /api/progress/sync — save reading progress for a chapter */
export const POST: APIRoute = async ({ request }) => {
  const user = getUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json().catch(() => null);
  if (!body?.bookSlug || !body?.chapterSlug || typeof body?.scrollRatio !== 'number') {
    return new Response(JSON.stringify({ error: 'bookSlug, chapterSlug, scrollRatio required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { bookSlug, chapterSlug, scrollRatio, completed } = body;

  // Upsert reading progress
  const existing = await db
    .select()
    .from(readingProgress)
    .where(
      and(
        eq(readingProgress.userId, user.userId),
        eq(readingProgress.bookSlug, bookSlug),
        eq(readingProgress.chapterSlug, chapterSlug),
      ),
    );

  if (existing.length > 0) {
    await db
      .update(readingProgress)
      .set({
        scrollRatio,
        completed: completed ?? scrollRatio >= 0.95,
        updatedAt: new Date(),
      })
      .where(eq(readingProgress.id, existing[0].id));
  } else {
    await db.insert(readingProgress).values({
      userId: user.userId,
      bookSlug,
      chapterSlug,
      scrollRatio,
      completed: completed ?? scrollRatio >= 0.95,
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
