import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';
import { layout } from './layout';

interface ReaderLayoutProps {
  title: string;
  description?: string;
  bookAccent?: string;
  children: HtmlEscapedString | string;
}

export function readerLayout({ title, description, bookAccent, children }: ReaderLayoutProps) {
  const extraHead = html`<link rel="stylesheet" href="/static/reader.css" />`;

  return layout({
    title,
    description,
    extraHead,
    bookAccent,
    children: html`
      <div id="progress-bar" class="progress-bar"></div>
      ${children}
      <footer class="site-footer">Dreams of the Deep</footer>
    `,
  });
}
