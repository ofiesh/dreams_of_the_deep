import { html, raw } from 'hono/html';
import { readerLayout } from '../reader-layout';
import type { ChapterEntry, BookMeta } from '../../lib/content-service';

interface TocPageProps {
  chapters: ChapterEntry[];
  bookSlug: string;
  book: BookMeta;
  preview?: boolean;
}

export function tocPage({ chapters, bookSlug, book, preview }: TocPageProps) {
  const title = preview ? `[Preview] ${book.title}` : book.title;
  const description = preview
    ? 'Preview — all chapters including drafts.'
    : `Table of contents for ${book.title} — ${book.description}`;
  const linkPrefix = preview ? '/preview' : '';

  const chapterItems = chapters.map((entry) => {
    const label = entry.data.chapter === 0 ? '' : `Chapter ${entry.data.chapter}`;
    const isDraft = entry.data.status === 'draft';

    // Extract version tag from slug: "chapter-01-v3-alt" → "v3-alt"
    const versionMatch = entry.slug.match(/-(v\d+.*)$/);
    const versionTag = versionMatch ? versionMatch[1] : '';

    if (preview) {
      return html`<li>
        <a href="${linkPrefix}/${bookSlug}/${entry.slug}">
          <span class="toc-chapter-number">
            ${label}
            ${versionTag ? html`<span class="toc-version-badge">${versionTag}</span>` : ''}
            ${isDraft ? html`<span class="toc-draft-badge">draft</span>` : ''}
          </span>
          <span class="toc-chapter-title">${entry.data.title}</span>
        </a>
      </li>`;
    }

    return html`<li>
      <a href="/${bookSlug}/${entry.slug}" data-slug="${entry.slug}">
        <span class="toc-chapter-number">${label}</span>
        <span class="toc-chapter-title">${entry.data.title}</span>
      </a>
      <div class="toc-progress" data-slug="${entry.slug}"></div>
    </li>`;
  });

  const continueReading = !preview
    ? html`<div id="continue-reading" class="continue-reading" hidden>
        <a id="continue-link" href="#">Continue reading &rarr;</a>
      </div>`
    : '';

  const previewBanner = preview
    ? html`<div class="preview-banner">Draft Preview</div>`
    : '';

  const tocScript = !preview
    ? html`<script>${raw(`
    function initTocProgress() {
      var page = document.querySelector('.contents-page');
      if (!page) return;
      var bookSlug = page.dataset.bookSlug || '';

      var progress;
      try {
        var raw = localStorage.getItem('dotd:progress:' + bookSlug);
        progress = raw ? JSON.parse(raw) : {};
      } catch(e) {
        progress = {};
      }

      var chapters = progress.chapters || {};

      document.querySelectorAll('.toc-progress').forEach(function(el) {
        var slug = el.dataset.slug || '';
        var ch = chapters[slug];
        if (ch && ch.furthest > 0) {
          var pct = Math.min(100, Math.round(ch.furthest * 100));
          var fill = document.createElement('div');
          fill.className = 'toc-progress-fill';
          fill.style.width = pct + '%';
          el.appendChild(fill);
          if (pct >= 100) el.classList.add('complete');
        }
      });

      if (progress.lastChapter && chapters[progress.lastChapter]) {
        var ch = chapters[progress.lastChapter];
        if (ch.current > 0 && ch.furthest < 1) {
          var container = document.getElementById('continue-reading');
          var link = document.getElementById('continue-link');
          if (container && link) {
            link.href = '/' + bookSlug + '/' + progress.lastChapter + '#resume';
            container.hidden = false;
          }
        }
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTocProgress);
    } else {
      initTocProgress();
    }
  `)}</script>`
    : '';

  const footer = !preview
    ? html`<footer class="site-footer">Work in progress</footer>`
    : '';

  return readerLayout({
    title,
    description,
    bookAccent: book.accentColor,
    children: html`
      <div class="page contents-page" data-book-slug="${bookSlug}">
        ${previewBanner}
        <h1 class="book-title">${book.title}</h1>
        <p class="book-subtitle">${book.subtitle}</p>

        ${continueReading}

        <nav class="toc">
          <ol class="toc-list">
            ${chapterItems}
          </ol>
        </nav>

        <div class="toc-home"><a href="/">&larr; Home</a></div>
        ${footer}
      </div>

      ${tocScript}
    `,
  });
}
