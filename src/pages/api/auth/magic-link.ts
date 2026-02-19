import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { magicLinks, users } from '../../../lib/db/schema';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';

export const prerender = false;

/** POST /api/auth/magic-link — request a magic link email */
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Valid email required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Ensure user exists (upsert)
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length === 0) {
    await db.insert(users).values({ email });
  }

  // Create magic link token
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await db.insert(magicLinks).values({ email, token, expiresAt });

  // TODO: send email via SES with link like /api/auth/verify?token=...
  // For now, log the token for development
  console.log(`[magic-link] ${email} → token=${token}`);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
