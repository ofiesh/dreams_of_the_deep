import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';

import { getChapter, getBookMeta, listBooks, getRecentChapters } from './lib/content-service';
import { getPublishedChapters, getAllChapters, chapterLabel } from './lib/chapters';

import { libraryPage } from './templates/pages/library';
import { tocPage } from './templates/pages/toc';
import { chapterPage } from './templates/pages/chapter';
import { previewLoginPage } from './templates/pages/preview-login';

const app = new Hono();

// ---- Static routes (registered first) ----

app.get('/', async (c) => {
  const books = await listBooks();
  const recentChapters = await getRecentChapters(5);
  return c.html(libraryPage({ books, recentChapters }));
});

app.get('/robots.txt', (c) => {
  return c.text('User-agent: *\nAllow: /\n');
});

// ---- Preview auth ----

function isAuthorized(c: { req: { query: (key: string) => string | undefined }; cookie: string | undefined }): boolean {
  const previewToken = process.env.PREVIEW_TOKEN;
  const jwtSecret = process.env.JWT_SECRET;
  if (!previewToken || !jwtSecret) return false;

  const token = c.req.query('token');
  if (token === previewToken) return true;

  if (c.cookie) {
    try {
      jwt.verify(c.cookie, jwtSecret);
      return true;
    } catch { /* invalid */ }
  }

  return false;
}

app.get('/preview/login', (c) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    const cookie = getCookie(c, 'dotd-preview');
    if (cookie) {
      try {
        jwt.verify(cookie, jwtSecret);
        return c.redirect('/preview');
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
    return c.redirect('/preview');
  }

  return c.html(previewLoginPage({ error: 'Invalid token.' }));
});

// Auth middleware for all preview routes
const previewAuth = async (c: any, next: any) => {
  // Skip auth for the login page itself to avoid redirect loop
  const path = new URL(c.req.url).pathname;
  if (path === '/preview/login') return next();

  const cookie = getCookie(c, 'dotd-preview');
  if (!isAuthorized({ req: { query: (k: string) => c.req.query(k) }, cookie })) {
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
};

app.use('/preview', previewAuth);
app.use('/preview/*', previewAuth);

app.get('/preview', async (c) => {
  const books = await listBooks();
  const recentChapters = await getRecentChapters(5);
  return c.html(libraryPage({ books, recentChapters, preview: true }));
});

app.get('/preview/:bookSlug', async (c) => {
  const bookSlug = c.req.param('bookSlug');
  const book = await getBookMeta(bookSlug);
  if (!book) return c.text('Not found', 404);

  const chapters = await getAllChapters(bookSlug);
  return c.html(tocPage({ chapters, bookSlug, book, preview: true }));
});

app.get('/preview/:bookSlug/:chapter', async (c) => {
  const bookSlug = c.req.param('bookSlug');
  const chapterParam = c.req.param('chapter');

  const book = await getBookMeta(bookSlug);
  if (!book) return c.text('Not found', 404);

  const entry = await getChapter(bookSlug, chapterParam);
  if (!entry) return c.text('Not found', 404);

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
      book,
      label,
      prevHref: prev ? `/preview/${bookSlug}/${prev.slug}` : '',
      nextHref: next ? `/preview/${bookSlug}/${next.slug}` : '',
      contentsHref: `/preview/${bookSlug}`,
      preview: true,
      isDraft,
    })
  );
});

// ---- Parameterized public routes (after static) ----

app.get('/:bookSlug', async (c, next) => {
  const bookSlug = c.req.param('bookSlug');
  // Skip paths that belong to static file middleware
  if (['images', 'static', 'favicon.svg', 'favicon.ico'].includes(bookSlug)) {
    return next();
  }
  const book = await getBookMeta(bookSlug);
  if (!book) return c.text('Not found', 404);

  const chapters = await getPublishedChapters(bookSlug);
  return c.html(tocPage({ chapters, bookSlug, book }));
});

app.get('/:bookSlug/:chapter', async (c, passthrough) => {
  const bookSlug = c.req.param('bookSlug');
  if (['images', 'static', 'favicon.svg', 'favicon.ico'].includes(bookSlug)) {
    return passthrough();
  }
  const chapterParam = c.req.param('chapter');

  const book = await getBookMeta(bookSlug);
  if (!book) return c.text('Not found', 404);

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
      book,
      label,
      prevHref: prev ? `/${bookSlug}/${prev.slug}` : '',
      nextHref: next ? `/${bookSlug}/${next.slug}` : '',
      contentsHref: `/${bookSlug}`,
    })
  );
});

export default app;
