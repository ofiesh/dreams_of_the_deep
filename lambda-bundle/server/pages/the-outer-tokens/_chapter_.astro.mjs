import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute, l as Fragment, u as unescapeHTML, n as renderScript } from '../../chunks/astro/server_BuE53ar_.mjs';
import 'piccolore';
import { g as getChapter, b as getPublishedChapters, c as chapterLabel, $ as $$ReaderLayout } from '../../chunks/chapters_NMjIrnHo.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$chapter = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$chapter;
  const bookSlug = "the-outer-tokens";
  const chapterParam = Astro2.params.chapter;
  const entry = await getChapter(bookSlug, chapterParam);
  if (!entry) {
    return new Response("Not found", { status: 404 });
  }
  if (entry.data.status !== "published") {
    return new Response("Not found", { status: 404 });
  }
  const chapters = await getPublishedChapters(bookSlug);
  const entryIndex = chapters.findIndex((e) => e.slug === chapterParam);
  const prev = entryIndex > 0 ? chapters[entryIndex - 1] : null;
  const next = entryIndex < chapters.length - 1 ? chapters[entryIndex + 1] : null;
  const label = chapterLabel(entry.data.chapter);
  const prevHref = prev ? `/${bookSlug}/${prev.slug}` : "";
  const nextHref = next ? `/${bookSlug}/${next.slug}` : "";
  return renderTemplate`${renderComponent($$result, "ReaderLayout", $$ReaderLayout, { "title": `${entry.data.title} \u2014 The Outer Tokens`, "description": entry.data.summary }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page" id="reader"${addAttribute(bookSlug, "data-book-slug")}${addAttribute(chapterParam, "data-chapter-slug")}${addAttribute(prevHref, "data-prev-chapter")}${addAttribute(nextHref, "data-next-chapter")}${addAttribute(label, "data-chapter-label")}${addAttribute(entry.data.title, "data-chapter-title")}> <div class="running-header" id="running-header">${label} — ${entry.data.title}</div> <div class="pager-viewport" id="pager-viewport"> <article class="chapter-body" id="chapter-body"> <header class="chapter-header"> <span class="chapter-number">${label}</span> <h1 class="chapter-title">${entry.data.title}</h1> </header> ${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${unescapeHTML(entry.html)}` })} </article> </div> </div> <div class="page-indicator" id="page-indicator"> <div class="indicator-row indicator-row-nav"> <a class="indicator-link" href="/">Home</a> <span class="indicator-sep">/</span> <a class="indicator-link"${addAttribute(`/${bookSlug}`, "href")}>Contents</a> </div> <div class="indicator-row indicator-row-pages"> <span class="page-nav"> <button class="page-nav-btn" id="page-prev" aria-label="Previous page">&lsaquo;</button> <span id="page-counter">1 / 1</span> <button class="page-nav-btn" id="page-next" aria-label="Next page">&rsaquo;</button> </span> <button class="settings-toggle" id="settings-toggle" aria-label="Reader settings">Aa</button> <div class="settings-panel" id="settings-panel" hidden> <div class="settings-row"> <button class="font-btn" id="font-down" aria-label="Decrease font size">A&minus;</button> <span class="font-label" id="font-label">100%</span> <button class="font-btn" id="font-up" aria-label="Increase font size">A+</button> </div> <div class="settings-row theme-row"> <button class="theme-btn" id="theme-light" data-theme="light" aria-label="Light theme">Light</button> <button class="theme-btn" id="theme-sepia" data-theme="sepia" aria-label="Sepia theme">Sepia</button> <button class="theme-btn" id="theme-dark" data-theme="dark" aria-label="Dark theme">Dark</button> </div> </div> </div> </div> ${renderScript($$result2, "C:/Users/Nathanial/code2/dreams_of_the_deep/src/pages/the-outer-tokens/[chapter].astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/Nathanial/code2/dreams_of_the_deep/src/pages/the-outer-tokens/[chapter].astro", void 0);

const $$file = "C:/Users/Nathanial/code2/dreams_of_the_deep/src/pages/the-outer-tokens/[chapter].astro";
const $$url = "/the-outer-tokens/[chapter]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$chapter,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
