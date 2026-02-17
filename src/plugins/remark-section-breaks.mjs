import { visit } from 'unist-util-visit';

/** Replace `---` thematic breaks with centered middle-dot dividers. */
export function remarkSectionBreaks() {
  return (tree) => {
    visit(tree, 'thematicBreak', (node, index, parent) => {
      if (parent && index != null) {
        parent.children[index] = {
          type: 'html',
          value: '<div class="section-break" aria-hidden="true">\u00B7\u2002\u00B7\u2002\u00B7</div>',
        };
      }
    });
  };
}
