import { html, raw } from 'hono/html';
import { layout } from '../layout';
import type { BookMeta, RecentChapter } from '../../lib/content-service';

interface LibraryPageProps {
  books: BookMeta[];
  recentChapters: RecentChapter[];
  preview?: boolean;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function chapterLabel(chapter: number): string {
  return chapter === 0 ? 'Prologue' : `Chapter ${chapter}`;
}

export function libraryPage({ books, recentChapters, preview }: LibraryPageProps) {
  const extraHead = html`<link rel="stylesheet" href="/static/library.css" />`;
  const linkPrefix = preview ? '/preview' : '';

  // Group recent chapters by book slug
  const recentByBook = new Map<string, RecentChapter[]>();
  for (const ch of recentChapters) {
    const list = recentByBook.get(ch.bookSlug) || [];
    list.push(ch);
    recentByBook.set(ch.bookSlug, list);
  }

  const bookCards = books.map((book) => {
    const bookRecent = recentByBook.get(book.slug) || [];

    const recentList = bookRecent.length > 0
      ? html`
        <ul class="book-card-recent">
          ${bookRecent.map(
            (ch) => html`
              <li>
                <a href="${linkPrefix}/${ch.bookSlug}/${ch.slug}" class="book-card-recent-link">
                  <span class="book-card-recent-chapter">${chapterLabel(ch.chapter)}</span>
                  <span class="book-card-recent-title">${ch.title}</span>
                  <span class="book-card-recent-date">${formatDate(ch.publishDate)}</span>
                </a>
              </li>
            `
          )}
        </ul>
      `
      : '';

    return html`
      <div class="book-card" style="--card-accent: ${book.accentColor}">
        <a href="${linkPrefix}/${book.slug}" class="book-card-link">
          <div class="book-card-cover">
            <img src="/images/${book.slug}/${book.coverImage}" alt="${book.title}" />
          </div>
          <div class="book-card-info">
            <h2 class="book-card-title">${book.title}</h2>
            <p class="book-card-subtitle">${book.subtitle}</p>
          </div>
          <div class="book-card-progress">
            <svg class="progress-ring" viewBox="0 0 36 36">
              <circle class="progress-ring-bg" cx="18" cy="18" r="15.9" />
              <circle class="progress-ring-fill" cx="18" cy="18" r="15.9"
                data-book-slug="${book.slug}" />
            </svg>
          </div>
        </a>
        ${recentList}
        ${book.status === 'coming-soon'
          ? html`<span class="book-card-badge">Coming Soon</span>`
          : ''}
      </div>
    `;
  });

  return layout({
    title: 'Dreams of the Deep',
    extraHead,
    suppressTheme: true,
    children: html`
      <div class="library">
        <canvas class="starfield" id="starfield"></canvas>
        <div class="library-bg">
          <div class="nebula nebula-1"></div>
          <div class="nebula nebula-2"></div>
        </div>

        <header class="library-header">
          <h1 class="library-title">Dreams of the Deep</h1>
          <p class="library-tagline">Science fiction, published chapter by chapter</p>
        </header>

        <section class="book-grid">
          ${bookCards}
        </section>

      </div>

      <script>${raw(`
        (function() {
          var canvas = document.getElementById('starfield');
          if (!canvas) return;
          var ctx = canvas.getContext('2d');
          var stars = [];
          var count = 200;

          function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
          }
          resize();
          window.addEventListener('resize', resize);

          for (var i = 0; i < count; i++) {
            stars.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              r: Math.random() * 1.2 + 0.3,
              base: Math.random() * 0.6 + 0.2,
              speed: Math.random() * 0.008 + 0.003,
              phase: Math.random() * Math.PI * 2
            });
          }

          function draw(t) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < stars.length; i++) {
              var s = stars[i];
              var shimmer = s.base + Math.sin(t * s.speed + s.phase) * 0.3;
              if (shimmer < 0.05) shimmer = 0.05;
              ctx.beginPath();
              ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(220, 215, 208, ' + shimmer + ')';
              ctx.fill();
            }
            requestAnimationFrame(draw);
          }
          requestAnimationFrame(draw);
        })();
      `)}</script>
      <script>${raw(`
        (function() {
          var cards = document.querySelectorAll('.progress-ring-fill');
          cards.forEach(function(circle) {
            var slug = circle.dataset.bookSlug;
            if (!slug) return;
            try {
              var raw = localStorage.getItem('dotd:progress:' + slug);
              if (!raw) return;
              var progress = JSON.parse(raw);
              var chapters = progress.chapters || {};
              var slugs = Object.keys(chapters);
              if (slugs.length === 0) return;
              var total = 0;
              var count = 0;
              for (var i = 0; i < slugs.length; i++) {
                var ch = chapters[slugs[i]];
                if (ch && ch.furthest > 0) {
                  total += ch.furthest;
                  count++;
                }
              }
              if (count === 0) return;
              var pct = total / slugs.length;
              var circumference = 2 * Math.PI * 15.9;
              var offset = circumference * (1 - pct);
              circle.style.strokeDasharray = circumference;
              circle.style.strokeDashoffset = offset;
              circle.classList.add('has-progress');
            } catch(e) {}
          });
        })();
      `)}</script>
    `,
  });
}
