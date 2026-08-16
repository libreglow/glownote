import { useEffect, useState } from 'react';
import type { GlowNode, GlowRoot } from '../glowmark/nodes';
import EditorNode from './EditorNode';
import SelectionToolbar from './SelectionToolbar';
import FloatingToolbar from './FloatingToolbar';
import { getEditorSelection } from './selection';
import { applyInlineFormat } from './inline/format';

interface EditorProps {
  ast: GlowRoot;
  onChange: (ast: GlowRoot) => void;
}

interface ToolbarState {
  visible: boolean;
  x: number;
  y: number;
}

export default function Editor({
  ast,
  onChange,
}: EditorProps) {
  const [children, setChildren] = useState(ast.children);

  useEffect(() => {
  function handleSelection() {
    const selection = getEditorSelection();

    if (!selection) {
      return;
    }

    console.log({
      text: selection.text,
      start: selection.start,
      end: selection.end,
      block: selection.block,
      rect: selection.rect,
    });
  }

  document.addEventListener(
    'selectionchange',
    handleSelection,
  );

  return () => {
    document.removeEventListener(
      'selectionchange',
      handleSelection,
    );
  };
}, []);

  const [toolbar, setToolbar] = useState<ToolbarState>({
    visible: false,
    x: 0,
    y: 0,
  });

  function updateBlock(index: number, text: string) {
    const nextChildren = children.map((node, i) => {
      if (i !== index) {
        return node;
      }

      if (!('children' in node)) {
        return node;
      }

      return {
        ...node,
        children: [
          {
            type: 'text' as const,
            value: text,
          },
        ],
      };
    });

    setChildren(nextChildren);

    onChange({
      ...ast,
      children: nextChildren,
    });
  }

  useEffect(() => {
    function updateSelection() {
      const selection = getTextSelection();

      if (!selection) {
        setToolbar((current) => ({
          ...current,
          visible: false,
        }));

        return;
      }

      const rect = selection.rect;

      setToolbar({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    }

    document.addEventListener(
      'selectionchange',
      updateSelection,
    );

    window.addEventListener(
      'resize',
      updateSelection,
    );

    window.addEventListener(
      'scroll',
      updateSelection,
      true,
    );

    return () => {
      document.removeEventListener(
        'selectionchange',
        updateSelection,
      );

      window.removeEventListener(
        'resize',
        updateSelection,
      );

      window.removeEventListener(
        'scroll',
        updateSelection,
        true,
      );
    };
  }, []);

  function applyFormat(format: 'strong' | 'emphasis') {
  const selection = getEditorSelection();

  if (!selection) {
    return;
  }

  const index = children.findIndex(
    (node) => {
      // نحتاج لاحقًا id أفضل من هذا،
      // لكن حاليًا نطابق الـblock بالـDOM.
      return true;
    },
  );

  const blockIndex = Array.from(
    document.querySelectorAll('[data-editor-block]'),
  ).indexOf(selection.block);

  if (blockIndex === -1) {
    return;
  }

  const block = children[blockIndex];

  if (!('children' in block)) {
    return;
  }

  const nextChildren = applyInlineFormat(
    block.children as any,
    selection.start,
    selection.end,
    format,
  );

  const nextAst: GlowRoot = {
    ...ast,
    children: children.map((node, i) =>
      i === blockIndex
        ? {
            ...node,
            children: nextChildren,
          }
        : node,
    ),
  };
console.log(
  'Updated AST:',
  JSON.stringify(nextAst, null, 2),
);
  setChildren(nextAst.children);
  onChange(nextAst);
}

 function applyInline(format: InlineFormat) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const selectedText = selection.toString();

  if (!selectedText) {
    return;
  }

  const range = selection.getRangeAt(0);

  const editorElement =
    (range.commonAncestorContainer instanceof HTMLElement
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement
    )?.closest('[data-glow-editor]');

  if (!editorElement) {
    return;
  }

  const blockElement =
    (range.startContainer instanceof HTMLElement
      ? range.startContainer
      : range.startContainer.parentElement
    )?.closest('[contenteditable]');

  if (!blockElement) {
    return;
  }

  const blocks = Array.from(
    editorElement.querySelectorAll('[contenteditable]'),
  );

  const blockIndex = blocks.indexOf(blockElement);

  if (blockIndex === -1) {
    return;
  }

  const node = children[blockIndex];

  if (!('children' in node)) {
    return;
  }

  const blockText = blockElement.textContent ?? '';

  const start = getTextOffset(
    blockElement,
    range.startContainer,
    range.startOffset,
  );

  const end = getTextOffset(
    blockElement,
    range.endContainer,
    range.endOffset,
  );

  const nextNode = {
    ...node,
    children: formatInlineText(
      node.children as GlowNode[],
      start,
      end,
      format,
    ),
  };

  const nextChildren = children.map(
    (child, index) =>
      index === blockIndex
        ? nextNode
        : child,
  );

  setChildren(nextChildren);

  onChange({
    ...ast,
    children: nextChildren,
  });
}

  function applyBlock(type: 'heading1' | 'heading2') {
    console.log(
      'Apply block:',
      type,
      window.getSelection()?.toString(),
    );
  }

  function getNodeVersion(node: GlowNode): string {
  return JSON.stringify(node);
}

  return (
      <>
    <div
      className="glow-editor space-y-2 px-4 py-6"
      data-glow-editor
    >
     {children.map((node, index) => (
  <EditorNode
    key={`${index}-${getNodeVersion(node)}`}
    node={node}
    onChange={(text) => {
      updateBlock(index, text);
    }}
  />
))}
    </div>

    <FloatingToolbar
      onBold={() => {
  const selection = getEditorSelection();

  if (!selection) {
    return;
  }

  const index = children.findIndex(
    (_, index) => {
      const element =
        document.querySelectorAll(
          '[data-editor-block]',
        )[index];

      return element === selection.block;
    },
  );

  if (index === -1) {
    return;
  }

  const node = children[index];

  const formatted = applyInlineFormat(
    node as GlowNode,
    selection.start,
    selection.end,
    'strong',
  );

  const next = [...children];
  next[index] = formatted;

  setChildren(next);

  onChange({
    ...ast,
    children: next,
  });
}}
      onItalic={() => {
        console.log('ITALIC');
      }}
    />
  </>
  );
}

function getTextOffset(
  root: HTMLElement,
  container: Node,
  offset: number,
): number {
  let result = 0;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
  );

  let current: Node | null;

  while ((current = walker.nextNode())) {
    if (current === container) {
      return result + offset;
    }

    result += current.textContent?.length ?? 0;
  }

  return result;
}