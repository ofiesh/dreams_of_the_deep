import { html, raw } from 'hono/html';
import { readerLayout } from '../reader-layout';
import type { ChapterEntry } from '../../lib/content-service';

interface ChapterPageProps {
  entry: ChapterEntry;
  bookSlug: string;
  label: string;
  prevHref: string;
  nextHref: string;
  contentsHref: string;
  preview?: boolean;
  isDraft?: boolean;
}

export function chapterPage({
  entry,
  bookSlug,
  label,
  prevHref,
  nextHref,
  contentsHref,
  preview,
  isDraft,
}: ChapterPageProps) {
  const titlePrefix = isDraft ? '[DRAFT] ' : '';
  const title = `${titlePrefix}${entry.data.title} — The Outer Tokens`;

  const seoJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Chapter',
    name: entry.data.title,
    position: entry.data.chapter,
    isPartOf: {
      '@type': 'Book',
      name: 'The Outer Tokens',
      author: { '@type': 'Person', name: 'Nathanial' },
    },
  });

  return readerLayout({
    title,
    description: entry.data.summary,
    children: html`
      ${!preview ? html`<script type="application/ld+json">${raw(seoJson)}</script>` : ''}
      <div
        class="page"
        id="reader"
        data-book-slug="${bookSlug}"
        data-chapter-slug="${entry.slug}"
        data-prev-chapter="${prevHref}"
        data-next-chapter="${nextHref}"
        data-chapter-label="${label}"
        data-chapter-title="${entry.data.title}"
      >
        ${isDraft ? html`<div class="preview-banner">Draft Preview</div>` : ''}
        <div class="running-header" id="running-header">${label} — ${entry.data.title}</div>
        <div class="pager-viewport" id="pager-viewport">
          <article class="chapter-body" id="chapter-body">
            <header class="chapter-header">
              <span class="chapter-number">${label}</span>
              <h1 class="chapter-title">${entry.data.title}</h1>
            </header>

            ${raw(entry.html)}
          </article>
        </div>
      </div>

      <div class="page-indicator" id="page-indicator">
        <div class="indicator-row indicator-row-nav">
          <a class="indicator-link" href="/">Home</a>
          <span class="indicator-sep">/</span>
          <a class="indicator-link" href="${contentsHref}">Contents</a>
        </div>
        <div class="indicator-row indicator-row-pages">
          <span class="page-nav">
            <button class="page-nav-btn" id="page-prev" aria-label="Previous page">&lsaquo;</button>
            <span id="page-counter">1 / 1</span>
            <button class="page-nav-btn" id="page-next" aria-label="Next page">&rsaquo;</button>
          </span>
          <button class="settings-toggle" id="settings-toggle" aria-label="Reader settings">Aa</button>
          <div class="settings-panel" id="settings-panel" hidden>
            <div class="settings-row">
              <button class="font-btn" id="font-down" aria-label="Decrease font size">A&minus;</button>
              <span class="font-label" id="font-label">100%</span>
              <button class="font-btn" id="font-up" aria-label="Increase font size">A+</button>
            </div>
            <div class="settings-row theme-row">
              <button class="theme-btn" id="theme-light" data-theme="light" aria-label="Light theme">Light</button>
              <button class="theme-btn" id="theme-sepia" data-theme="sepia" aria-label="Sepia theme">Sepia</button>
              <button class="theme-btn" id="theme-dark" data-theme="dark" aria-label="Dark theme">Dark</button>
            </div>
          </div>
        </div>
      </div>

      <script defer src="/static/paged-reader.js"></script>
    `,
  });
}
