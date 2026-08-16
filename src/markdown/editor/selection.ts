export interface EditorSelection {
  block: HTMLElement;
  start: number;
  end: number;
}

export function getEditorSelection(): EditorSelection | null {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  if (selection.isCollapsed) {
    return null;
  }

  const range = selection.getRangeAt(0);

  const container =
    range.commonAncestorContainer instanceof Element
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;

  if (!container) {
    return null;
  }

  const block =
    container.closest<HTMLElement>(
      '[data-editor-block]',
    );

  if (!block) {
    return null;
  }

  const start = getTextOffset(
    block,
    range.startContainer,
    range.startOffset,
  );

  const end = getTextOffset(
    block,
    range.endContainer,
    range.endOffset,
  );

  return {
    block,
    start: Math.min(start, end),
    end: Math.max(start, end),
  };
}

function getTextOffset(
  root: HTMLElement,
  container: Node,
  offset: number,
): number {
  let result = 0;
  let found = false;

  function walk(node: Node) {
    if (found) {
      return;
    }

    if (node === container) {
      if (node.nodeType === Node.TEXT_NODE) {
        result += offset;
      } else {
        for (
          let i = 0;
          i < offset;
          i++
        ) {
          const child = node.childNodes[i];

          if (child) {
            result +=
              child.textContent?.length ?? 0;
          }
        }
      }

      found = true;
      return;
    }

    for (const child of node.childNodes) {
      if (child === container) {
        walk(child);

        if (found) {
          return;
        }
      } else {
        const before = result;

        walk(child);

        if (found) {
          return;
        }

        result +=
          child.textContent?.length ?? 0;

        /*
         * Prevent double counting when the recursive
         * call already handled this branch.
         */
        if (result < before) {
          result = before;
        }
      }
    }
  }

  /*
   * Simpler and safer implementation:
   * use a TreeWalker over text nodes.
   */
  result = 0;
  found = false;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
  );

  let current: Node | null;

  while ((current = walker.nextNode())) {
    if (current === container) {
      return result + offset;
    }

    result +=
      current.textContent?.length ?? 0;
  }

  return result;
}