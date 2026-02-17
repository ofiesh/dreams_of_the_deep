import { visit } from 'unist-util-visit';

/** Remove top-level `# heading` — title comes from frontmatter. */
export function remarkStripTitle() {
  return (tree) => {
    visit(tree, 'heading', (node, index, parent) => {
      if (node.depth === 1 && parent && index != null) {
        parent.children.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
  };
}
