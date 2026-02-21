import { e as createComponent, r as renderTemplate, o as renderSlot, p as renderHead, g as addAttribute, h as createAstro } from './astro/server_BuE53ar_.mjs';
import 'piccolore';
import 'clsx';
/* empty css                             */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title, description = "Dreams of the Deep \u2014 Science fiction, published chapter by chapter.", ogImage } = Astro2.props;
  const canonicalURL = new URL(Astro2.url.pathname, Astro2.site ?? "https://dreamsofthedeep.com");
  return renderTemplate(_a || (_a = __template(['<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>', '</title><meta name="description"', '><link rel="canonical"', '><!-- Open Graph --><meta property="og:title"', '><meta property="og:description"', '><meta property="og:type" content="website"><meta property="og:url"', ">", `<!-- Preconnect to Google Fonts for potential future use --><link rel="icon" type="image/svg+xml" href="/favicon.svg"><script>
    // Apply saved reader settings before paint to avoid theme/font flash
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
  <\/script>`, "</head> <body> ", " </body></html>"])), title, addAttribute(description, "content"), addAttribute(canonicalURL, "href"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(canonicalURL, "content"), ogImage && renderTemplate`<meta property="og:image"${addAttribute(ogImage, "content")}>`, renderHead(), renderSlot($$result, $$slots["default"]));
}, "C:/Users/Nathanial/code2/dreams_of_the_deep/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
