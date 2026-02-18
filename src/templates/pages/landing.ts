import { html } from 'hono/html';
import { layout } from '../layout';

export function landingPage() {
  const extraHead = html`<link rel="stylesheet" href="/static/landing.css" />
<link rel="stylesheet" href="/static/reader.css" />`;

  return layout({
    title: 'Dreams of the Deep',
    extraHead,
    children: html`
      <div class="landing">
        <p class="landing-site-title">Dreams of the Deep</p>

        <div class="landing-book">
          <div class="landing-cover">
            <a href="/the-outer-tokens">
              <img src="/images/the-outer-tokens/cover.png" alt="The Outer Tokens" />
            </a>
          </div>

          <a href="/the-outer-tokens" class="landing-read-link">Read</a>
        </div>
      </div>
    `,
  });
}
