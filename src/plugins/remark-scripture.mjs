import { visit } from 'unist-util-visit';

/**
 * Fully-italic paragraphs (wrapped in single `*...*`) get the `scripture` class.
 * These are standalone italic blocks used for in-world scripture/fragment passages.
 */
export function remarkScripture() {
  return (tree) => {
    visit(tree, 'paragraph', (node) => {
      // A "scripture" paragraph has exactly one child that is an emphasis node
      if (node.children.length === 1 && node.children[0].type === 'emphasis') {
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        node.data.hProperties.className = ['scripture'];
      }
    });
  };
}
