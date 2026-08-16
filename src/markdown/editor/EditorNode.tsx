import { useEffect, useRef } from 'react';
import type { GlowNode } from '../glowmark/nodes';
import { renderNode } from '../renderer';



interface EditorNodeProps {
  node: GlowNode;
  onChange: (text: string) => void;
}

export default function EditorNode({
  node,
  onChange,
}: EditorNodeProps) {
  const ref = useRef<HTMLDivElement>(null);

  const editable =
    node.type === 'paragraph' ||
    node.type === 'heading';

  /*
   * Read-only / custom blocks.
   *
   * Examples:
   * - wave
   * - code
   * - future custom nodes
   */
  if (!editable) {
    return (
      <div
        data-editor-block
        className="px-2 py-1"
      >
        {renderNode(node)}
      </div>
    );
  }


  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    if (element.childNodes.length === 0) {
      renderInlineDOM(element, node);
    }
  }, []);

  return (
    <div
      ref={ref}
      data-editor-block
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onKeyDown={(event) => {
  if (event.key !== 'Enter') {
    return;
  }

  event.preventDefault();

  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);

  const block = event.currentTarget;

  const preCaretRange = range.cloneRange();

  preCaretRange.selectNodeContents(block);
  preCaretRange.setEnd(
    range.endContainer,
    range.endOffset,
  );

  const offset =
    preCaretRange.toString().length;

  const text =
    block.textContent ?? '';

  const before = text.slice(0, offset);
  const after = text.slice(offset);

  onChange(
    before,
  );

}}
      role="textbox"
      aria-multiline="true"
      className={getEditorClass(node)}
      onInput={(event) => {
        const element = event.currentTarget;
        onChange(element.textContent ?? '');
      }}
    />
  );
}

function renderInlineDOM(
  element: HTMLElement,
  node: GlowNode,
): void {
  if (!('children' in node)) {
    return;
  }

  for (const child of node.children) {
    appendInlineNode(
      element,
      child as GlowNode,
    );
  }
}


function appendInlineNode(
  parent: Node,
  node: GlowNode,
): void {
  switch (node.type) {
    case 'text': {
      parent.appendChild(
        document.createTextNode(node.value),
      );

      return;
    }

    case 'strong': {
      const element =
        document.createElement('strong');

      appendChildren(element, node);

      parent.appendChild(element);

      return;
    }

    case 'emphasis': {
      const element =
        document.createElement('em');

      appendChildren(element, node);

      parent.appendChild(element);

      return;
    }

    default: {
    
      if ('children' in node) {
        appendChildren(parent, node);
      }

      return;
    }
  }
}

function appendChildren(
  parent: Node,
  node: GlowNode,
): void {
  if (!('children' in node)) {
    return;
  }

  for (const child of node.children) {
    appendInlineNode(
      parent,
      child as GlowNode,
    );
  }
}

function getEditorClass(
  node: GlowNode,
): string {
  const base =
    'outline-none px-2 py-1 min-h-6';

  switch (node.type) {
    case 'heading':
      return `${base} text-4xl font-bold tracking-tight`;

    case 'paragraph':
    default:
      return `${base} text-base leading-7`;
  }
}