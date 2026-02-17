import { visit } from 'unist-util-visit';

/**
 * Style blockquotes as epigraphs with the `epigraph` class.
 * Attribution lines (paragraphs starting with em-dash) get `epigraph-source`.
 */
export function remarkEpigraph() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties.className = ['epigraph'];

      // Check individual paragraphs for attribution lines
      for (const child of node.children) {
        if (child.type !== 'paragraph') continue;
        const text = getTextContent(child.children).trim();
        if (text.startsWith('\u2014') || text.startsWith('—')) {
          child.data = child.data || {};
          child.data.hProperties = child.data.hProperties || {};
          child.data.hProperties.className = ['epigraph-source'];
        }
      }
    });
  };
}

function getTextContent(nodes) {
  let text = '';
  for (const node of nodes) {
    if (node.type === 'text') text += node.value;
    else if (node.children) text += getTextContent(node.children);
  }
  return text;
}
