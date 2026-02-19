import type { APIRoute } from 'astro';
import { getUser } from '../../../lib/auth';

export const prerender = false;

/** GET /api/auth/me — return the current authenticated user (or 401) */
export const GET: APIRoute = async ({ request }) => {
  const user = getUser(request);
  if (!user) {
    return new Response(JSON.stringify({ user: null }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
