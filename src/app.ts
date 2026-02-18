import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';

import { getChapter } from './lib/content-service';
import { getPublishedChapters, getAllChapters, chapterLabel } from './lib/chapters';

import { landingPage } from './templates/pages/landing';
import { tocPage } from './templates/pages/toc';
import { chapterPage } from './templates/pages/chapter';
import { previewLoginPage } from './templates/pages/preview-login';

const app = new Hono();

// ---- Public routes ----

app.get('/', (c) => c.html(landingPage()));

app.get('/the-outer-tokens', async (c) => {
  const bookSlug = 'the-outer-tokens';
  const chapters = await getPublishedChapters(bookSlug);
  return c.html(tocPage({ chapters, bookSlug }));
});

app.get('/the-outer-tokens/:chapter', async (c) => {
  const bookSlug = 'the-outer-tokens';
  const chapterParam = c.req.param('chapter');

  const entry = await getChapter(bookSlug, chapterParam);
  if (!entry || entry.data.status !== 'published') {
    return c.text('Not found', 404);
  }

  const chapters = await getPublishedChapters(bookSlug);
  const entryIndex = chapters.findIndex((e) => e.slug === chapterParam);
  const prev = entryIndex > 0 ? chapters[entryIndex - 1] : null;
  const next = entryIndex < chapters.length - 1 ? chapters[entryIndex + 1] : null;

  const label = chapterLabel(entry.data.chapter);

  return c.html(
    chapterPage({
      entry,
      bookSlug,
      label,
      prevHref: prev ? `/${bookSlug}/${prev.slug}` : '',
      nextHref: next ? `/${bookSlug}/${next.slug}` : '',
      contentsHref: `/${bookSlug}`,
    })
  );
});

// ---- robots.txt ----

app.get('/robots.txt', (c) => {
  return c.text('User-agent: *\nAllow: /\n');
});

// ---- Preview auth middleware ----

function isAuthorized(c: { req: { query: (key: string) => string | undefined }; cookie: string | undefined }): boolean {
  const previewToken = process.env.PREVIEW_TOKEN;
  const jwtSecret = process.env.JWT_SECRET;
  if (!previewToken || !jwtSecret) return false;

  // Check query param
  const token = c.req.query('token');
  if (token === previewToken) return true;

  // Check cookie
  if (c.cookie) {
    try {
      jwt.verify(c.cookie, jwtSecret);
      return true;
    } catch { /* invalid */ }
  }

  return false;
}

app.use('/preview/*', async (c, next) => {
  // Skip auth for login page
  if (c.req.path === '/preview/login') {
    return next();
  }

  const cookie = getCookie(c, 'dotd-preview');
  if (!isAuthorized({ req: { query: (k) => c.req.query(k) }, cookie })) {
    return c.redirect('/preview/login');
  }

  // If authenticating via query token, set cookie
  if (c.req.query('token')) {
    const jwtSecret = process.env.JWT_SECRET!;
    const cookieValue = jwt.sign({ preview: true }, jwtSecret, { expiresIn: '24h' });
    setCookie(c, 'dotd-preview', cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 86400,
      path: '/preview',
    });
  }

  return next();
});

// ---- Preview login ----

app.get('/preview/login', (c) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    const cookie = getCookie(c, 'dotd-preview');
    if (cookie) {
      try {
        jwt.verify(cookie, jwtSecret);
        return c.redirect('/preview/the-outer-tokens');
      } catch { /* expired or invalid, show form */ }
    }
  }

  return c.html(previewLoginPage());
});

app.post('/preview/login', async (c) => {
  const jwtSecret = process.env.JWT_SECRET;
  const previewToken = process.env.PREVIEW_TOKEN;

  const body = await c.req.parseBody();
  const token = (body['token'] as string) ?? '';

  if (token && token === previewToken && jwtSecret) {
    const cookieValue = jwt.sign({ preview: true }, jwtSecret, { expiresIn: '24h' });
    setCookie(c, 'dotd-preview', cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 86400,
      path: '/preview',
    });
    return c.redirect('/preview/the-outer-tokens');
  }

  return c.html(previewLoginPage({ error: 'Invalid token.' }));
});

// ---- Preview routes ----

app.get('/preview/the-outer-tokens', async (c) => {
  const bookSlug = 'the-outer-tokens';
  const chapters = await getAllChapters(bookSlug);
  return c.html(tocPage({ chapters, bookSlug, preview: true }));
});

app.get('/preview/the-outer-tokens/:chapter', async (c) => {
  const bookSlug = 'the-outer-tokens';
  const chapterParam = c.req.param('chapter');

  const entry = await getChapter(bookSlug, chapterParam);
  if (!entry) {
    return c.text('Not found', 404);
  }

  const chapters = await getAllChapters(bookSlug);
  const entryIndex = chapters.findIndex((e) => e.slug === chapterParam);
  const prev = entryIndex > 0 ? chapters[entryIndex - 1] : null;
  const next = entryIndex < chapters.length - 1 ? chapters[entryIndex + 1] : null;

  const label = chapterLabel(entry.data.chapter);
  const isDraft = entry.data.status === 'draft';

  return c.html(
    chapterPage({
      entry,
      bookSlug,
      label,
      prevHref: prev ? `/preview/${bookSlug}/${prev.slug}` : '',
      nextHref: next ? `/preview/${bookSlug}/${next.slug}` : '',
      contentsHref: `/preview/${bookSlug}`,
      preview: true,
      isDraft,
    })
  );
});

export default app;
