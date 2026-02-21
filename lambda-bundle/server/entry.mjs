import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DuA6UWpq.mjs';
import { manifest } from './manifest_BBBCH0Hg.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/preview/login.astro.mjs');
const _page2 = () => import('./pages/preview/the-outer-tokens/_chapter_.astro.mjs');
const _page3 = () => import('./pages/preview/the-outer-tokens.astro.mjs');
const _page4 = () => import('./pages/the-outer-tokens/_chapter_.astro.mjs');
const _page5 = () => import('./pages/the-outer-tokens.astro.mjs');
const _page6 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/preview/login.astro", _page1],
    ["src/pages/preview/the-outer-tokens/[chapter].astro", _page2],
    ["src/pages/preview/the-outer-tokens/index.astro", _page3],
    ["src/pages/the-outer-tokens/[chapter].astro", _page4],
    ["src/pages/the-outer-tokens/index.astro", _page5],
    ["src/pages/index.astro", _page6]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "middleware",
    "client": "file:///C:/Users/Nathanial/code2/dreams_of_the_deep/dist/client/",
    "server": "file:///C:/Users/Nathanial/code2/dreams_of_the_deep/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
