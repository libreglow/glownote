import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseMarkdown } from '../markdown/glowmark/parser';
import {
  createEditorBlocks,
  getBlockChildren,
  getBlockText,
  updateBlockSource,
  type EditorBlock,
} from '../markdown/glowmark/editor/EditorState';
import {
  handleBlockKeyDown,
  type BlockKeyboardContext,
} from '../markdown/glowmark/editor/input/keyboard';

let activeRange: Range | null = null;

const selectionStub = {
  get rangeCount() {
    return activeRange ? 1 : 0;
  },
  get isCollapsed() {
    return activeRange ? activeRange.collapsed : false;
  },
  getRangeAt: () => activeRange!,
  removeAllRanges: () => {},
  addRange: () => {},
};

beforeEach(() => {
  activeRange = null;
  vi.spyOn(window, 'getSelection').mockReturnValue(
    selectionStub as unknown as Selection,
  );
});

function makeContext() {
  const blocks: EditorBlock[] = [];
  const elements = new Map<string, HTMLElement>();
  const ctx: BlockKeyboardContext = {
    setBlockSource: (id, source) => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index !== -1) {
        blocks[index] = {
          ...blocks[index],
          source,
          node: updateBlockSource(blocks[index].node, source),
        };
      }
      const el = elements.get(id);
      if (el && el.textContent !== source) el.textContent = source;
    },
    removeBlock: (id) => {
      blocks.splice(
        blocks.findIndex((b) => b.id === id),
        1,
      );
    },
    insertBlockAfter: (id, node) => {
      const nextId = `new-${blocks.length}`;
      blocks.splice(blocks.findIndex((b) => b.id === id) + 1, 0, {
        id: nextId,
        source: getBlockText(node),
        node,
      });
      return nextId;
    },
    replaceBlock: (id, node) => {
      const index = blocks.findIndex((b) => b.id === id);
      blocks[index] = { id, source: getBlockText(node), node };
    },
    transformBlock: (id, node, source) => {
      const index = blocks.findIndex((b) => b.id === id);
      blocks[index] = { id, source, node };
    },
    previousBlock: (id) => blocks[blocks.findIndex((b) => b.id === id) - 1],
    nextBlock: (id) => blocks[blocks.findIndex((b) => b.id === id) + 1],
    focusBlock: () => {},
  };
  return { ctx, blocks, elements };
}

function makeBlock(
  ctx: ReturnType<typeof makeContext>,
  index: number,
): EditorBlock {
  const block = ctx.blocks[index];
  const el = document.createElement('div');
  el.contentEditable = 'true';
  el.textContent = getBlockText(block.node);
  ctx.elements.set(block.id, el);
  return block;
}

function pressKey(
  el: HTMLElement,
  key: string,
  block: EditorBlock,
  ctx: ReturnType<typeof makeContext>['ctx'],
) {
  const handler = (event: Event) =>
    handleBlockKeyDown(
      event as unknown as React.KeyboardEvent<HTMLDivElement>,
      block,
      ctx,
    );
  el.addEventListener('keydown', handler);
  el.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
  );
  el.removeEventListener('keydown', handler);
}

function setSelection(el: HTMLElement, offset: number) {
  activeRange = document.createRange();
  const textNode = el.firstChild;
  if (textNode && textNode.nodeType === Node.TEXT_NODE) {
    activeRange.setStart(textNode, offset);
  } else {
    activeRange.setStart(el, offset);
  }
  activeRange.collapse(true);
}

describe('keyboard input', () => {
  it('splits a block on Enter and moves the remainder into a new paragraph', () => {
    const ast = parseMarkdown('Hello world');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    const block = makeBlock({ ctx, blocks, elements }, 0);
    const el = elements.get(block.id)!;
    setSelection(el, 5);

    pressKey(el, 'Enter', block, ctx);

    expect(blocks).toHaveLength(2);
    expect(el.textContent).toBe('Hello');
    expect(getBlockText(blocks[1].node)).toBe(' world');
    expect(blocks[1].node.type).toBe('paragraph');
  });

  it('removes an empty block on Backspace and keeps the previous block', () => {
    const ast = parseMarkdown('First\n\nSecond');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    const first = makeBlock({ ctx, blocks, elements }, 0);
    const second = makeBlock({ ctx, blocks, elements }, 1);
    const el = elements.get(second.id)!;
    el.textContent = '';
    blocks[1] = { ...blocks[1], source: '' };
    setSelection(el, 0);

    pressKey(el, 'Backspace', blocks[1], ctx);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe(first.id);
    expect(elements.get(first.id)!.textContent).toBe('First');
  });

  it('merges a non-empty block into the previous block when caret is at start', () => {
    const ast = parseMarkdown('First\n\nSecond');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    makeBlock({ ctx, blocks, elements }, 0);
    const second = makeBlock({ ctx, blocks, elements }, 1);
    const el = elements.get(second.id)!;
    setSelection(el, 0);

    pressKey(el, 'Backspace', second, ctx);

    expect(blocks).toHaveLength(1);
    expect(elements.get(blocks[0].id)!.textContent).toBe('FirstSecond');
  });
});

describe('markdown block shortcuts', () => {
  it('transforms # + Space into a heading', () => {
    const ast = parseMarkdown('\\#');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    const block = makeBlock({ ctx, blocks, elements }, 0);
    const el = elements.get(block.id)!;
    setSelection(el, 1);

    pressKey(el, ' ', block, ctx);

    expect(blocks[0].node.type).toBe('heading');
    expect((blocks[0].node as { depth: number }).depth).toBe(1);
    expect(blocks[0].source).toBe('');
  });

  it('transforms - + Space into a list item', () => {
    const ast = parseMarkdown('\\-');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    const block = makeBlock({ ctx, blocks, elements }, 0);
    const el = elements.get(block.id)!;
    setSelection(el, 1);

    pressKey(el, ' ', block, ctx);

    expect(blocks[0].node.type).toBe('listItem');
    expect(blocks[0].source).toBe('');
  });

  it('transforms 1. + Space into an ordered list item', () => {
    const ast = parseMarkdown('1\\.');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    const block = makeBlock({ ctx, blocks, elements }, 0);
    const el = elements.get(block.id)!;
    setSelection(el, 2);

    pressKey(el, ' ', block, ctx);

    expect(blocks[0].node.type).toBe('listItem');
    expect(blocks[0].source).toBe('');
  });

  it('transforms > + Space into a blockquote', () => {
    const ast = parseMarkdown('\\>');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    const block = makeBlock({ ctx, blocks, elements }, 0);
    const el = elements.get(block.id)!;
    setSelection(el, 1);

    pressKey(el, ' ', block, ctx);

    expect(blocks[0].node.type).toBe('blockquote');
  });

  it('transforms ``` + Space into a code block', () => {
    const ast = parseMarkdown('\\`\\`\\`');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    const block = makeBlock({ ctx, blocks, elements }, 0);
    const el = elements.get(block.id)!;
    setSelection(el, 3);

    pressKey(el, ' ', block, ctx);

    expect(blocks[0].node.type).toBe('code');
  });
});

describe('list editing', () => {
  it('continues a list on Enter', () => {
    const ast = parseMarkdown('- Hello');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    const block = makeBlock({ ctx, blocks, elements }, 0);
    const el = elements.get(block.id)!;
    setSelection(el, 5);

    pressKey(el, 'Enter', block, ctx);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].node.type).toBe('listItem');
    expect(blocks[1].node.type).toBe('listItem');
    expect(getBlockText(blocks[1].node)).toBe('');
  });

  it('exits the list on Enter of an empty item', () => {
    const ast = parseMarkdown('- ');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    const block = makeBlock({ ctx, blocks, elements }, 0);
    const el = elements.get(block.id)!;
    setSelection(el, 0);

    pressKey(el, 'Enter', block, ctx);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].node.type).toBe('paragraph');
  });

  it('merges a list item back into the previous item on Backspace', () => {
    const ast = parseMarkdown('- one\n- two');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    makeBlock({ ctx, blocks, elements }, 0);
    const second = makeBlock({ ctx, blocks, elements }, 1);
    const el = elements.get(second.id)!;
    setSelection(el, 0);

    pressKey(el, 'Backspace', second, ctx);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].node.type).toBe('listItem');
    expect(getBlockText(blocks[0].node)).toBe('onetwo');
  });
});

describe('heading and blockquote behavior', () => {
  it('splits a heading into heading + paragraph on Enter', () => {
    const ast = parseMarkdown('# Title');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    const block = makeBlock({ ctx, blocks, elements }, 0);
    const el = elements.get(block.id)!;
    setSelection(el, 5);

    pressKey(el, 'Enter', block, ctx);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].node.type).toBe('heading');
    expect(getBlockText(blocks[0].node)).toBe('Title');
    expect(blocks[1].node.type).toBe('paragraph');
  });

  it('demotes a heading to a paragraph on Backspace at the start', () => {
    const ast = parseMarkdown('# Title');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    const block = makeBlock({ ctx, blocks, elements }, 0);
    const el = elements.get(block.id)!;
    setSelection(el, 0);

    pressKey(el, 'Backspace', block, ctx);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].node.type).toBe('paragraph');
    expect(getBlockText(blocks[0].node)).toBe('Title');
  });

  it('continues a blockquote on Enter', () => {
    const ast = parseMarkdown('> quote');
    const { ctx, blocks, elements } = makeContext();
    blocks.push(...createEditorBlocks(ast));
    const block = makeBlock({ ctx, blocks, elements }, 0);
    const el = elements.get(block.id)!;
    setSelection(el, 5);

    pressKey(el, 'Enter', block, ctx);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].node.type).toBe('blockquote');
    expect(blocks[1].node.type).toBe('blockquote');
  });
});

describe('inline formatting', () => {
  it('parses typed markdown through the editor source model', () => {
    const ast = parseMarkdown('');
    const [block] = createEditorBlocks(ast);

    expect(block.source).toBe('');
  });

  it('inline tokenizer produces the same AST the renderer displays', () => {
    const ast = parseMarkdown('**hello** *world*');
    const [block] = createEditorBlocks(ast);

    expect(getBlockChildren(block.node).map((c) => c.type)).toEqual([
      'strong',
      'text',
      'emphasis',
    ]);
    expect(block.source).toBe('**hello** *world*');
  });});
