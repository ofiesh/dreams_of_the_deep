import { html, raw } from 'hono/html';
import { layout } from '../layout';

interface PreviewLoginProps {
  error?: string;
}

export function previewLoginPage({ error }: PreviewLoginProps = {}) {
  return layout({
    title: 'Preview Login — Dreams of the Deep',
    children: html`
      <div class="page login-page">
        <h1 class="login-title">Preview Access</h1>
        <p class="login-subtitle">Enter the preview token to view unpublished chapters.</p>

        ${error ? html`<p class="login-error">${error}</p>` : ''}

        <form method="POST" class="login-form">
          <input
            type="password"
            name="token"
            placeholder="Preview token"
            class="login-input"
            required
            autocomplete="off"
          />
          <button type="submit" class="login-button">Enter</button>
        </form>

        <div class="login-home"><a href="/">&larr; Home</a></div>
      </div>

      <style>${raw(`
        .login-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }
        .login-title {
          font-size: 1.5rem;
          font-weight: normal;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        .login-subtitle {
          font-size: 0.85rem;
          color: #a89f96;
          margin-bottom: 2rem;
        }
        .login-error {
          color: #b44;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          max-width: 280px;
        }
        .login-input {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1rem;
          padding: 0.6rem 0.8rem;
          border: 1px solid #d4cec6;
          background: #fff;
          color: #1c1917;
          text-align: center;
          outline: none;
        }
        .login-input:focus {
          border-color: #a89f96;
        }
        .login-button {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.6rem 1.2rem;
          border: 1px solid #1c1917;
          background: #1c1917;
          color: #f8f5f0;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .login-button:hover {
          opacity: 0.85;
        }
        .login-home {
          margin-top: 2rem;
          font-size: 0.85rem;
        }
        .login-home a {
          color: #a89f96;
          text-decoration: none;
        }
        .login-home a:hover {
          color: #1c1917;
        }
      `)}</style>
    `,
  });
}
