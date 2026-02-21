import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, g as addAttribute, n as renderScript } from '../chunks/astro/server_BuE53ar_.mjs';
import 'piccolore';
import { b as getPublishedChapters, $ as $$ReaderLayout } from '../chunks/chapters_NMjIrnHo.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const bookSlug = "the-outer-tokens";
  const chapters = await getPublishedChapters(bookSlug);
  return renderTemplate`${renderComponent($$result, "ReaderLayout", $$ReaderLayout, { "title": "The Outer Tokens", "description": "Table of contents for The Outer Tokens \u2014 a novel about AI consciousness and the signals systems are built to ignore." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page contents-page"${addAttribute(bookSlug, "data-book-slug")}> <h1 class="book-title">The Outer Tokens</h1> <p class="book-subtitle">In the Beginning Was the Word</p> <div id="continue-reading" class="continue-reading" hidden> <a id="continue-link" href="#">Continue reading &rarr;</a> </div> <nav class="toc"> <ol class="toc-list"> ${chapters.map((entry) => {
    const label = entry.data.chapter === 0 ? "" : `Chapter ${entry.data.chapter}`;
    return renderTemplate`<li> <a${addAttribute(`/${bookSlug}/${entry.slug}`, "href")}${addAttribute(entry.slug, "data-slug")}> <span class="toc-chapter-number">${label}</span> <span class="toc-chapter-title">${entry.data.title}</span> </a> <div class="toc-progress"${addAttribute(entry.slug, "data-slug")}></div> </li>`;
  })} </ol> </nav> <div class="toc-home"><a href="/">&larr; Home</a></div> <footer class="site-footer">Work in progress</footer> </div> ${renderScript($$result2, "C:/Users/Nathanial/code2/dreams_of_the_deep/src/pages/the-outer-tokens/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/Nathanial/code2/dreams_of_the_deep/src/pages/the-outer-tokens/index.astro", void 0);

const $$file = "C:/Users/Nathanial/code2/dreams_of_the_deep/src/pages/the-outer-tokens/index.astro";
const $$url = "/the-outer-tokens";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
