/**
 * Paged Reader — Kindle/Kobo-style pagination using CSS multi-column layout.
 *
 * Turns a long-scroll chapter into fixed viewport pages with click, keyboard,
 * and swipe navigation, progress tracking, and position memory.
 */

const COLUMN_GAP = 80;
const SWIPE_THRESHOLD = 50;
const RESIZE_DEBOUNCE_MS = 250;
const PROGRESS_KEY = 'dotd:progress:';
const SETTINGS_KEY = 'dotd:reader-settings';

const BASE_FONT_SIZE = 18;
const FONT_STEP = 1;
const FONT_MIN = 7;
const FONT_MAX = 24;

type Theme = 'light' | 'sepia' | 'dark';

interface ReaderSettings {
  fontSize: number;
  theme: Theme;
}

interface ChapterProgress {
  current: number;   // 0-1 ratio of last viewed position
  furthest: number;  // 0-1 ratio high water mark (only advances forward)
}

interface BookProgress {
  lastChapter: string;
  chapters: Record<string, ChapterProgress>;
}

let currentPage = 0;
let totalPages = 1;
let pageWidth = 0;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

// Touch tracking
let touchStartX = 0;
let touchStartY = 0;

// DOM refs (assigned in init)
let viewport: HTMLElement;
let chapterBody: HTMLElement;
let pageCounter: HTMLElement;
let progressBar: HTMLElement | null;
let bookSlug: string;
let chapterSlug: string;
let prevChapterHref: string;
let nextChapterHref: string;

function getLineHeight(): number {
  const body = document.querySelector('.chapter-body p');
  if (!body) return 32.76; // 18px * 1.82
  return parseFloat(getComputedStyle(body).lineHeight) || 32.76;
}

function snapToLineHeight(height: number, lineHeight: number): number {
  return Math.floor(height / lineHeight) * lineHeight;
}

function calculateLayout() {
  const indicator = document.getElementById('page-indicator');
  const indicatorHeight = indicator?.offsetHeight ?? 36;
  const page = document.getElementById('reader')!;
  const pageStyle = getComputedStyle(page);
  const paddingTop = parseFloat(pageStyle.paddingTop);

  const availableHeight = window.innerHeight - paddingTop - indicatorHeight;
  const lineHeight = getLineHeight();
  const pagerHeight = snapToLineHeight(availableHeight, lineHeight);

  viewport.style.height = pagerHeight + 'px';
  viewport.style.flex = 'none';

  pageWidth = viewport.clientWidth;
  chapterBody.style.columnWidth = pageWidth + 'px';
}

function calculatePages() {
  // scrollWidth = n * pageWidth + (n-1) * gap
  // Solving for n: n = (scrollWidth + gap) / (pageWidth + gap)
  const scrollW = chapterBody.scrollWidth;
  totalPages = Math.max(1, Math.round((scrollW + COLUMN_GAP) / (pageWidth + COLUMN_GAP)));
}

function goToPage(n: number, save = true) {
  currentPage = Math.max(0, Math.min(n, totalPages - 1));
  const offset = -(currentPage * (pageWidth + COLUMN_GAP));
  chapterBody.style.transform = `translateX(${offset}px)`;

  pageCounter.textContent = `${currentPage + 1} / ${totalPages}`;

  if (progressBar) {
    const ratio = totalPages > 1 ? currentPage / (totalPages - 1) : 1;
    progressBar.style.width = (ratio * 100) + '%';
  }

  if (save) {
    saveProgress();
  }
}

function nextPage() {
  if (currentPage < totalPages - 1) {
    goToPage(currentPage + 1);
  } else if (nextChapterHref) {
    location.href = nextChapterHref;
  }
}

function prevPage() {
  if (currentPage > 0) {
    goToPage(currentPage - 1);
  } else if (prevChapterHref) {
    location.href = prevChapterHref;
  }
}

// --- Progress Tracking ---

function progressKey(): string {
  return PROGRESS_KEY + bookSlug;
}

function loadBookProgress(): BookProgress {
  try {
    const raw = localStorage.getItem(progressKey());
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { lastChapter: '', chapters: {} };
}

function saveProgress() {
  const ratio = totalPages > 1 ? currentPage / (totalPages - 1) : 1;
  const progress = loadBookProgress();
  const ch = progress.chapters[chapterSlug] ?? { current: 0, furthest: 0 };
  ch.current = ratio;
  ch.furthest = Math.max(ch.furthest, ratio);
  progress.chapters[chapterSlug] = ch;
  progress.lastChapter = chapterSlug;
  try {
    localStorage.setItem(progressKey(), JSON.stringify(progress));
  } catch { /* ignore */ }
}

function getInitialPage(): number {
  // #resume hash: restore saved position (used by "Continue reading" link)
  if (location.hash === '#resume') {
    const progress = loadBookProgress();
    const ch = progress.chapters[chapterSlug];
    if (ch) return Math.round(ch.current * Math.max(1, totalPages - 1));
    return 0;
  }

  // #page-N hash: go to specific page
  const hashMatch = location.hash.match(/^#page-(\d+)$/);
  if (hashMatch) return Math.max(0, parseInt(hashMatch[1], 10) - 1);

  // On reload/back-forward: restore saved position
  // On fresh navigation (from TOC, chapter nav): start at page 1
  try {
    const entries = performance.getEntriesByType('navigation');
    if (entries.length > 0) {
      const nav = entries[0] as PerformanceNavigationTiming;
      if (nav.type === 'reload' || nav.type === 'back_forward') {
        const progress = loadBookProgress();
        const ch = progress.chapters[chapterSlug];
        if (ch) return Math.round(ch.current * Math.max(1, totalPages - 1));
      }
    }
  } catch { /* ignore */ }

  return 0;
}

// --- Navigation Handlers ---

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.closest('a')) return;

  const x = e.clientX;
  const third = window.innerWidth / 3;

  if (x < third) {
    prevPage();
  } else {
    nextPage();
  }
}

function handleKeydown(e: KeyboardEvent) {
  // Don't capture keys when settings panel is open
  const panel = document.getElementById('settings-panel');
  if (panel && !panel.hidden) return;

  switch (e.key) {
    case 'ArrowRight':
    case 'PageDown':
      e.preventDefault();
      nextPage();
      break;
    case 'ArrowLeft':
    case 'PageUp':
      e.preventDefault();
      prevPage();
      break;
    case 'Home':
      e.preventDefault();
      goToPage(0);
      break;
    case 'End':
      e.preventDefault();
      goToPage(totalPages - 1);
      break;
  }
}

function handleTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) {
      nextPage();
    } else {
      prevPage();
    }
  }
}

// --- Resize ---

function handleResize() {
  if (resizeTimer) clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    const ratio = totalPages > 1 ? currentPage / (totalPages - 1) : 0;

    chapterBody.style.transition = 'none';
    chapterBody.style.transform = 'translateX(0)';

    calculateLayout();
    void chapterBody.offsetHeight;

    requestAnimationFrame(() => {
      calculatePages();
      const restored = Math.round(ratio * (totalPages - 1));
      goToPage(restored, false);
      requestAnimationFrame(() => {
        chapterBody.style.transition = '';
      });
    });
  }, RESIZE_DEBOUNCE_MS);
}

// --- Reader Settings ---

function loadSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        fontSize: Math.max(FONT_MIN, Math.min(FONT_MAX, parsed.fontSize ?? BASE_FONT_SIZE)),
        theme: ['light', 'sepia', 'dark'].includes(parsed.theme) ? parsed.theme : 'light',
      };
    }
  } catch { /* ignore */ }
  return { fontSize: BASE_FONT_SIZE, theme: 'light' };
}

function saveSettings(settings: ReaderSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove('theme-light', 'theme-sepia', 'theme-dark');
  if (theme !== 'light') {
    html.classList.add(`theme-${theme}`);
  }
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', (btn as HTMLElement).dataset.theme === theme);
  });
}

function applyFontSize(size: number) {
  document.documentElement.style.fontSize = size + 'px';
  const label = document.getElementById('font-label');
  if (label) {
    label.textContent = Math.round((size / BASE_FONT_SIZE) * 100) + '%';
  }
}

function initSettings() {
  const toggle = document.getElementById('settings-toggle');
  const panel = document.getElementById('settings-panel');
  const fontDown = document.getElementById('font-down');
  const fontUp = document.getElementById('font-up');

  if (!toggle || !panel || !fontDown || !fontUp) return;

  const settings = loadSettings();
  applyTheme(settings.theme);
  applyFontSize(settings.fontSize);

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !panel.hidden;
    panel.hidden = open;
    toggle.setAttribute('aria-expanded', String(!open));
  });

  document.addEventListener('click', (e) => {
    if (!panel.hidden && !panel.contains(e.target as Node) && e.target !== toggle) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  fontDown.addEventListener('click', (e) => {
    e.stopPropagation();
    settings.fontSize = Math.max(FONT_MIN, settings.fontSize - FONT_STEP);
    applyFontSize(settings.fontSize);
    saveSettings(settings);
    recalcAfterSettingsChange();
  });

  fontUp.addEventListener('click', (e) => {
    e.stopPropagation();
    settings.fontSize = Math.min(FONT_MAX, settings.fontSize + FONT_STEP);
    applyFontSize(settings.fontSize);
    saveSettings(settings);
    recalcAfterSettingsChange();
  });

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      settings.theme = (btn as HTMLElement).dataset.theme as Theme;
      applyTheme(settings.theme);
      saveSettings(settings);
    });
  });
}

function recalcAfterSettingsChange() {
  const ratio = totalPages > 1 ? currentPage / (totalPages - 1) : 0;

  chapterBody.style.transition = 'none';
  chapterBody.style.transform = 'translateX(0)';

  calculateLayout();
  void chapterBody.offsetHeight;

  requestAnimationFrame(() => {
    calculatePages();
    const restored = Math.round(ratio * (totalPages - 1));
    goToPage(restored, false);
    requestAnimationFrame(() => {
      chapterBody.style.transition = '';
    });
  });
}

// --- Init ---

function init() {
  const vp = document.getElementById('pager-viewport');
  const cb = document.getElementById('chapter-body');
  const pc = document.getElementById('page-counter');
  const reader = document.getElementById('reader');

  if (!vp || !cb || !pc || !reader) return;

  viewport = vp;
  chapterBody = cb;
  pageCounter = pc;
  progressBar = document.getElementById('progress-bar');
  bookSlug = reader.dataset.bookSlug ?? '';
  chapterSlug = reader.dataset.chapterSlug ?? '';
  prevChapterHref = reader.dataset.prevChapter ?? '';
  nextChapterHref = reader.dataset.nextChapter ?? '';

  document.documentElement.classList.add('paged-mode');
  initSettings();

  // Suppress transition for initial positioning
  chapterBody.style.transition = 'none';
  calculateLayout();

  requestAnimationFrame(() => {
    calculatePages();
    const initialPage = getInitialPage();
    goToPage(Math.min(initialPage, totalPages - 1), initialPage > 0);

    requestAnimationFrame(() => {
      chapterBody.style.transition = '';
    });

    viewport.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    viewport.addEventListener('touchstart', handleTouchStart, { passive: true });
    viewport.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('resize', handleResize);

    // Visible prev/next buttons
    document.getElementById('page-prev')?.addEventListener('click', prevPage);
    document.getElementById('page-next')?.addEventListener('click', nextPage);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
