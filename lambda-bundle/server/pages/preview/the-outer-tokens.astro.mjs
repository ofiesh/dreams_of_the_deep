import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_BuE53ar_.mjs';
import 'piccolore';
import jwt from 'jsonwebtoken';
import { a as getAllChapters, $ as $$ReaderLayout } from '../../chunks/chapters_NMjIrnHo.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const PREVIEW_TOKEN = "ThornOwnSufferJoyStill4";
  const JWT_SECRET = "your-jwt-secret-here";
  function isAuthorized(request) {
    const url2 = new URL(request.url);
    const token = url2.searchParams.get("token");
    if (token === PREVIEW_TOKEN) return true;
    const cookies = request.headers.get("cookie") ?? "";
    const match = cookies.match(/dotd-preview=([^;]+)/);
    if (match) {
      try {
        jwt.verify(match[1], JWT_SECRET);
        return true;
      } catch {
      }
    }
    return false;
  }
  if (!isAuthorized(Astro2.request)) {
    return Astro2.redirect("/preview/login");
  }
  const url = new URL(Astro2.request.url);
  const setCookie = url.searchParams.has("token");
  if (setCookie) {
    const cookieValue = jwt.sign({ preview: true }, JWT_SECRET, { expiresIn: "24h" });
    Astro2.cookies.set("dotd-preview", cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 86400,
      path: "/preview"
    });
  }
  const bookSlug = "the-outer-tokens";
  const chapters = await getAllChapters(bookSlug);
  return renderTemplate`${renderComponent($$result, "ReaderLayout", $$ReaderLayout, { "title": "[Preview] The Outer Tokens", "description": "Preview — all chapters including drafts." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page contents-page"${addAttribute(bookSlug, "data-book-slug")}> <div class="preview-banner">Draft Preview</div> <h1 class="book-title">The Outer Tokens</h1> <p class="book-subtitle">In the Beginning Was the Word</p> <nav class="toc"> <ol class="toc-list"> ${chapters.map((entry) => {
    const label = entry.data.chapter === 0 ? "" : `Chapter ${entry.data.chapter}`;
    const isDraft = entry.data.status === "draft";
    return renderTemplate`<li> <a${addAttribute(`/preview/${bookSlug}/${entry.slug}`, "href")}> <span class="toc-chapter-number"> ${label} ${isDraft && renderTemplate`<span class="toc-draft-badge">draft</span>`} </span> <span class="toc-chapter-title">${entry.data.title}</span> </a> </li>`;
  })} </ol> </nav> <div class="toc-home"><a href="/">&larr; Home</a></div> </div> ` })}`;
}, "C:/Users/Nathanial/code2/dreams_of_the_deep/src/pages/preview/the-outer-tokens/index.astro", void 0);
const $$file = "C:/Users/Nathanial/code2/dreams_of_the_deep/src/pages/preview/the-outer-tokens/index.astro";
const $$url = "/preview/the-outer-tokens";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
