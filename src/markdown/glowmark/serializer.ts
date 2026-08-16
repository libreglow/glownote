import { unified } from 'unified';
import remarkStringify from 'remark-stringify';
import type { Root } from 'mdast';
import type { GlowListItem, GlowNode, GlowRoot } from './nodes';
import { nodeRegistry } from './registry';

type NodeType = string;

const customHandlers: Record<
  NodeType,
  (node: any, parent: any, state: any, info: any) => string
> = {};

for (const definition of nodeRegistry.all()) {
  if (definition.custom) {
    customHandlers[definition.type] = directiveHandler;
  }
}

customHandlers['containerDirective'] = directiveHandler;

const serializer = unified().use(remarkStringify, {
  handlers: customHandlers,
});

export function stringifyMarkdown(tree: any) {
  const root: GlowRoot = {
    ...tree,
    children: groupAdjacentLists(tree.children ?? []),
  };

  return serializer.stringify(root as unknown as Root);
}

function directiveHandler(node: any, _parent: any, state: any, info: any) {
  const attributes = Object.entries(node.attributes ?? {})
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  const body = state.containerFlow(node, info);

  return `:::${node.name ?? node.type}${attributes ? `{${attributes}}` : ''}\n${body}\n:::`;
}

function groupAdjacentLists(children: GlowNode[]): GlowNode[] {
  const grouped: GlowNode[] = [];
  let i = 0;

  while (i < children.length) {
    const current = children[i];

    if (current.type === 'listItem') {
      const items: GlowNode[] = [current];
      const ordered = (current as GlowListItem).ordered ?? false;

      while (
        i + 1 < children.length &&
        children[i + 1].type === 'listItem' &&
        ((children[i + 1] as GlowListItem).ordered ?? false) === ordered
      ) {
        items.push(children[i + 1]);
        i++;
      }

      grouped.push({
        type: 'list',
        ordered,
        spread: (items as GlowListItem[]).some(
          (item) => item.children.length > 1,
        ),
        children: items,
      } as GlowNode);

      i++;
      continue;
    }

    grouped.push(current);
    i++;
  }

  return grouped;
}