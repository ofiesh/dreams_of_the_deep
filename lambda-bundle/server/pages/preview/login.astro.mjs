import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead } from '../../chunks/astro/server_BuE53ar_.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_CzWu0NDb.mjs';
/* empty css                                        */
import jwt from 'jsonwebtoken';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const JWT_SECRET = "your-jwt-secret-here";
  const PREVIEW_TOKEN = "ThornOwnSufferJoyStill4";
  {
    const cookies = Astro2.request.headers.get("cookie") ?? "";
    const match = cookies.match(/dotd-preview=([^;]+)/);
    if (match) {
      try {
        jwt.verify(match[1], JWT_SECRET);
        return Astro2.redirect("/preview/the-outer-tokens/");
      } catch {
      }
    }
  }
  let error = "";
  if (Astro2.request.method === "POST") {
    const formData = await Astro2.request.formData();
    const token = formData.get("token")?.toString() ?? "";
    if (token && token === PREVIEW_TOKEN && JWT_SECRET) {
      const cookieValue = jwt.sign({ preview: true }, JWT_SECRET, { expiresIn: "24h" });
      Astro2.cookies.set("dotd-preview", cookieValue, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 86400,
        path: "/preview"
      });
      return Astro2.redirect("/preview/the-outer-tokens/");
    }
    error = "Invalid token.";
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Preview Login — Dreams of the Deep", "data-astro-cid-zjll4i2s": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page login-page" data-astro-cid-zjll4i2s> <h1 class="login-title" data-astro-cid-zjll4i2s>Preview Access</h1> <p class="login-subtitle" data-astro-cid-zjll4i2s>Enter the preview token to view unpublished chapters.</p> ${error && renderTemplate`<p class="login-error" data-astro-cid-zjll4i2s>${error}</p>`} <form method="POST" class="login-form" data-astro-cid-zjll4i2s> <input type="password" name="token" placeholder="Preview token" class="login-input" required autocomplete="off" data-astro-cid-zjll4i2s> <button type="submit" class="login-button" data-astro-cid-zjll4i2s>Enter</button> </form> <div class="login-home" data-astro-cid-zjll4i2s><a href="/" data-astro-cid-zjll4i2s>&larr; Home</a></div> </div> ` })} `;
}, "C:/Users/Nathanial/code2/dreams_of_the_deep/src/pages/preview/login.astro", void 0);
const $$file = "C:/Users/Nathanial/code2/dreams_of_the_deep/src/pages/preview/login.astro";
const $$url = "/preview/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
