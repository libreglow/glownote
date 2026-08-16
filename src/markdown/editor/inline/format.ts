import type { GlowNode } from '../../glowmark/nodes';

export function applyInlineFormat(
  node: GlowNode,
  start: number,
  end: number,
  format: 'strong' | 'emphasis',
): GlowNode {
  if (
    node.type !== 'paragraph' &&
    node.type !== 'heading'
  ) {
    return node;
  }

  if (!('children' in node)) {
    return node;
  }

  return {
    ...node,
    children: formatChildren(
      node.children as GlowNode[],
      start,
      end,
      format,
    ),
  };
}

function formatChildren(
  children: GlowNode[],
  start: number,
  end: number,
  format: 'strong' | 'emphasis',
): GlowNode[] {
  const result: GlowNode[] = [];

  let offset = 0;

  for (const child of children) {
    const text = getNodeText(child);
    const childStart = offset;
    const childEnd = offset + text.length;

    if (
      end <= childStart ||
      start >= childEnd
    ) {
      result.push(child);
      offset = childEnd;
      continue;
    }

    if (child.type === 'text') {
      const localStart = Math.max(
        0,
        start - childStart,
      );

      const localEnd = Math.min(
        text.length,
        end - childStart,
      );

      if (localStart > 0) {
        result.push({
          type: 'text',
          value: text.slice(0, localStart),
        });
      }

      const selected = text.slice(
        localStart,
        localEnd,
      );

      result.push({
        type: format,
        children: [
          {
            type: 'text',
            value: selected,
          },
        ],
      });

      if (localEnd < text.length) {
        result.push({
          type: 'text',
          value: text.slice(localEnd),
        });
      }
    } else if ('children' in child) {
      result.push({
        ...child,
        children: formatChildren(
          child.children as GlowNode[],
          Math.max(0, start - childStart),
          Math.min(
            text.length,
            end - childStart,
          ),
          format,
        ),
      });
    } else {
      result.push(child);
    }

    offset = childEnd;
  }

  return mergeAdjacentText(result);
}

function getNodeText(node: GlowNode): string {
  if (node.type === 'text') {
    return node.value;
  }

  if (!('children' in node)) {
    return '';
  }

  return node.children
    .map((child) =>
      getNodeText(child as GlowNode),
    )
    .join('');
}

function mergeAdjacentText(
  nodes: GlowNode[],
): GlowNode[] {
  const result: GlowNode[] = [];

  for (const node of nodes) {
    const previous =
      result[result.length - 1];

    if (
      previous?.type === 'text' &&
      node.type === 'text'
    ) {
      previous.value += node.value;
      continue;
    }

    result.push(node);
  }

  return result;
}