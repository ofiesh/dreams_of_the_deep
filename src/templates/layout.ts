import { html, raw } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

interface LayoutProps {
  title: string;
  description?: string;
  ogImage?: string;
  extraHead?: HtmlEscapedString | string;
  children: HtmlEscapedString | string;
}

export function layout({ title, description, ogImage, extraHead, children }: LayoutProps) {
  const desc = description ?? 'Dreams of the Deep — Science fiction, published chapter by chapter.';

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
  ${extraHead ?? ''}
  <script>${raw(`
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
  `)}</script>
</head>
<body>
  ${children}
</body>
</html>`;
}
