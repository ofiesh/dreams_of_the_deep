import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { remarkStripTitle } from '../plugins/remark-strip-title.mjs';
import { remarkSectionBreaks } from '../plugins/remark-section-breaks.mjs';
import { remarkEpigraph } from '../plugins/remark-epigraph.mjs';
import { remarkScripture } from '../plugins/remark-scripture.mjs';
import remarkSmartypants from 'remark-smartypants';

const processor = unified()
  .use(remarkParse)
  .use(remarkStripTitle)
  .use(remarkSectionBreaks)
  .use(remarkEpigraph)
  .use(remarkScripture)
  .use(remarkSmartypants)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function renderMarkdown(markdown: string): Promise<string> {
  const result = await processor.process(markdown);
  return String(result);
}
