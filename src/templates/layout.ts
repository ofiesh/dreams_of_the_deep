import { html, raw } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

interface LayoutProps {
  title: string;
  description?: string;
  ogImage?: string;
  extraHead?: HtmlEscapedString | string;
  bookAccent?: string;
  suppressTheme?: boolean;
  children: HtmlEscapedString | string;
}

export function layout({ title, description, ogImage, extraHead, bookAccent, suppressTheme, children }: LayoutProps) {
  const desc = description ?? 'Dreams of the Deep — Science fiction, published chapter by chapter.';

  const accentStyle = bookAccent
    ? html`<style>:root { --book-accent: ${bookAccent}; }</style>`
    : '';

  const themeScript = suppressTheme
    ? ''
    : html`<script>${raw(`
    (function() {
      try {
        var s = JSON.parse(localStorage.getItem('dotd:reader-settings') || '{}');
        if (s.theme && s.theme !== 'light') {
          document.documentElement.classList.add('theme-' + s.theme);
        }
        if (s.fontSize && s.fontSize !== 18) {
          document.documentElement.style.fontSize = s.fontSize + 'px';
        }
      } catch(e) {}
    })();
  `)}</script>`;

  const bodyAttrs = suppressTheme ? ' style="background:#141820"' : '';

  return html`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />

  <!-- Open Graph -->
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:type" content="website" />
  ${ogImage ? html`<meta property="og:image" content="${ogImage}" />` : ''}

  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="stylesheet" href="/static/global.css" />
  ${accentStyle}
  ${extraHead ?? ''}
  ${themeScript}
</head>
<body${raw(bodyAttrs)}>
  ${children}
</body>
</html>`;
}
