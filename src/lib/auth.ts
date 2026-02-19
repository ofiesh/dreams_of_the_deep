import jwt from 'jsonwebtoken';
import type { AstroGlobal } from 'astro';

const JWT_SECRET = import.meta.env.JWT_SECRET || process.env.JWT_SECRET!;
const COOKIE_NAME = 'dotd_token';

export interface AuthPayload {
  userId: string;
  email: string;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

/** Read the auth cookie and verify the JWT. Returns null if not authenticated. */
export function getUser(request: Request): AuthPayload | null {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;

  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;

  return verifyToken(match[1]);
}

/** Build a Set-Cookie header string. */
export function authCookie(token: string, maxAgeDays = 30): string {
  const maxAge = maxAgeDays * 24 * 60 * 60;
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`;
}

export function clearAuthCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}
