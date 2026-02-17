// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import { remarkStripTitle } from './src/plugins/remark-strip-title.mjs';
import { remarkSectionBreaks } from './src/plugins/remark-section-breaks.mjs';
import { remarkEpigraph } from './src/plugins/remark-epigraph.mjs';
import { remarkScripture } from './src/plugins/remark-scripture.mjs';
import remarkSmartypants from 'remark-smartypants';

export default defineConfig({
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  markdown: {
    remarkPlugins: [
      remarkStripTitle,
      remarkSectionBreaks,
      remarkEpigraph,
      remarkScripture,
      remarkSmartypants,
    ],
  },
  vite: {
    ssr: {
      noExternal: ['drizzle-orm'],
    },
  },
});
