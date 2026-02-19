import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { magicLinks, users } from '../../../lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { signToken, authCookie } from '../../../lib/auth';

export const prerender = false;

/** GET /api/auth/verify?token=... — verify a magic link and set auth cookie */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Missing token', { status: 400 });
  }

  // Find valid, unused magic link
  const [link] = await db
    .select()
    .from(magicLinks)
    .where(
      and(
        eq(magicLinks.token, token),
        eq(magicLinks.used, false),
        gt(magicLinks.expiresAt, new Date()),
      ),
    );

  if (!link) {
    return new Response('Invalid or expired link', { status: 401 });
  }

  // Mark link as used
  await db.update(magicLinks).set({ used: true }).where(eq(magicLinks.id, link.id));

  // Get user
  const [user] = await db.select().from(users).where(eq(users.email, link.email));
  if (!user) {
    return new Response('User not found', { status: 404 });
  }

  const jwt = signToken({ userId: user.id, email: user.email });

  // Redirect to home with auth cookie set
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': authCookie(jwt),
    },
  });
};
