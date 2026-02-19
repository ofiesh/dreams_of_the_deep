import type { APIRoute } from 'astro';
import { clearAuthCookie } from '../../../lib/auth';

export const prerender = false;

/** POST /api/auth/logout — clear auth cookie */
export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearAuthCookie(),
    },
  });
};
