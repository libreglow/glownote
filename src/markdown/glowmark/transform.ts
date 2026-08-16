import type { Root } from "mdast";
import { nodeRegistry } from "./registry";

export function transformGlowMark(tree: Root) {
  visit(tree);

  return tree;
}

function visit(node: any) {
  if (!node.children) {
    return;
  }

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];

    if (child.type === "containerDirective") {
      const definition = nodeRegistry.get(child.name);

      if (definition?.custom) {
        node.children[i] = {
          type: child.name,
          attributes: child.attributes ?? {},
          children: child.children ?? [],
        };

        continue;
      }
    }

    visit(child);
  }
}