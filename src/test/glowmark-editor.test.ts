import { describe, expect, it } from 'vitest';
import { tokenizeInline } from '../markdown/glowmark/editor/inline/tokenizer';
import { serializeInline } from '../markdown/glowmark/editor/inline/serialize';
import { splitInlineNodes } from '../markdown/glowmark/editor/inline/ast';
import { inlineNodesEqual } from '../markdown/glowmark/editor/inline/ast';
import {
  domOffsetToSourceOffset,
  sourceOffsetToDomOffset,
} from '../markdown/glowmark/editor/selection';
import type { Leaf } from '../markdown/glowmark/editor/inline/tokenizer';
import {
  createEditorBlocks,
  getBlockChildren,
  getBlockSource,
  isEditableBlock,
  setBlockSource,
  updateBlockSource,
} from '../markdown/glowmark/editor/EditorState';
import { parseMarkdown } from '../markdown/glowmark/parser';
import { stringifyMarkdown } from '../markdown/glowmark/serializer';

function stripPositions(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(stripPositions);
  }

  if (node && typeof node === 'object') {
    const { position, ...rest } = node as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [key, stripPositions(value)]),
    );
  }

  return node;
}
import type { GlowNode } from '../markdown/glowmark/nodes';

describe('inline tokenizer', () => {
  it('parses strong, emphasis, delete and inline code', () => {
    const { nodes } = tokenizeInline('**hello** *world* ~~gone~~ `code`');

    expect(nodes).toHaveLength(7);
    expect(nodes[0]).toEqual({ type: 'strong', children: [{ type: 'text', value: 'hello' }] });
    expect(nodes[2]).toEqual({ type: 'emphasis', children: [{ type: 'text', value: 'world' }] });
    expect(nodes[4]).toEqual({ type: 'delete', children: [{ type: 'text', value: 'gone' }] });
    expect(nodes[6]).toEqual({ type: 'inlineCode', value: 'code' });
  });

  it('supports nested formatting', () => {
    const { nodes } = tokenizeInline('Hello **beautiful *world***');

    expect(nodes[0]).toEqual({ type: 'text', value: 'Hello ' });
    expect(nodes[1]).toEqual({
      type: 'strong',
      children: [
        { type: 'text', value: 'beautiful ' },
        { type: 'emphasis', children: [{ type: 'text', value: 'world' }] },
      ],
    });
  });

  it('parses links and round-trips through serialization', () => {
    const source = 'Hello **world** [link](https://example.com)';

    const { nodes } = tokenizeInline(source);

    expect(nodes[3]).toEqual({
      type: 'link',
      url: 'https://example.com',
      children: [{ type: 'text', value: 'link' }],
    });
    expect(serializeInline(nodes)).toBe(source);
  });

  it('leaves map source offsets to visible dom offsets', () => {
    const { leaves } = tokenizeInline('**hello**');
    const domOffset = sourceOffsetToDomOffset(leaves, 8);
    const sourceOffset = domOffsetToSourceOffset(leaves, domOffset);

    expect(domOffset).toBe(5);
    expect(sourceOffset).toBe(7);
  });

  it('maps a caret inside a formatted leaf back to the source', () => {
    const source = 'Hello **beautiful *world***';
    const { leaves } = tokenizeInline(source);
    const dom = sourceOffsetToDomOffset(leaves, 10);
    const back = domOffsetToSourceOffset(leaves, dom);

    expect(back).toBe(10);
  });

  it('treats unclosed markers as plain text', () => {
    const { nodes } = tokenizeInline('**unclosed');

    expect(nodes).toEqual([{ type: 'text', value: '**unclosed' }]);
  });
});

describe('inline splitting', () => {
  it('splits formatted text without breaking the markdown on either side', () => {
    const { nodes } = tokenizeInline('**hello**');
    const { left, right } = splitInlineNodes(nodes, 3);

    expect(serializeInline(left)).toBe('**hel**');
    expect(serializeInline(right)).toBe('**lo**');
  });

  it('splits at the end into an empty right side', () => {
    const { nodes } = tokenizeInline('**hello**');
    const { left, right } = splitInlineNodes(nodes, 5);

    expect(serializeInline(left)).toBe('**hello**');
    expect(serializeInline(right)).toBe('');
  });

  it('splits plain text exactly', () => {
    const { nodes } = tokenizeInline('Hello world');
    const { left, right } = splitInlineNodes(nodes, 5);

    expect(serializeInline(left)).toBe('Hello');
    expect(serializeInline(right)).toBe(' world');
  });
});

describe('inline equality', () => {
  it('detects structural changes', () => {
    expect(inlineNodesEqual([{ type: 'text', value: 'x' }], [{ type: 'text', value: 'x' }])).toBe(true);
    expect(inlineNodesEqual([{ type: 'text', value: 'x' }], [{ type: 'text', value: 'y' }])).toBe(false);
    expect(
      inlineNodesEqual(
        [{ type: 'text', value: '**x**' }],
        [{ type: 'strong', children: [{ type: 'text', value: 'x' }] }],
      ),
    ).toBe(false);
  });
});

describe('block source model', () => {
  it('keeps raw markdown source separate from the AST', () => {
    const ast = parseMarkdown('**hello**');
    const [block] = createEditorBlocks(ast);

    expect(block.source).toBe('**hello**');
    expect(stripPositions(getBlockChildren(block.node))).toEqual([
      {
        type: 'strong',
        children: [{ type: 'text', value: 'hello' }],
      },
    ]);
  });

  it('flattens lists into list item blocks', () => {
    const ast = parseMarkdown('- one\n- two');
    const blocks = createEditorBlocks(ast);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].node.type).toBe('listItem');
    expect(blocks[1].node.type).toBe('listItem');
    expect(getBlockSource(blocks[0].node)).toBe('one');
  });

  it('groups adjacent list items back into a list on serialize', () => {
    const ast = parseMarkdown('- one\n- two');
    const blocks = createEditorBlocks(ast);
    const root = { type: 'root', children: blocks.map((b) => b.node) };

    expect(stringifyMarkdown(root)).toMatch(/[-*] one\n[-*] two/);
  });

  it('round-trips ordered list items', () => {
    const ast = parseMarkdown('1. one\n2. two');
    const blocks = createEditorBlocks(ast);
    const root = { type: 'root', children: blocks.map((b) => b.node) };
    const out = stringifyMarkdown(root);

    expect(out).toContain('1. one\n2. two');
  });

  it('edits block source through the paragraph of a list item', () => {
    const ast = parseMarkdown('- **bold**');
    const [block] = createEditorBlocks(ast);
    const updated = updateBlockSource(block.node, 'plain');

    expect(isEditableBlock(updated)).toBe(true);
    expect(getBlockSource(updated)).toBe('plain');
    expect(
      (updated as unknown as { children: { children: GlowNode[] }[] }).children[0].children[0],
    ).toEqual({ type: 'text', value: 'plain' });  });

  it('round-trips custom wave nodes through edit + serialize', () => {
    const ast = parseMarkdown(':::wave{speed="2"}\nHello\n:::');
    const blocks = createEditorBlocks(ast);
    const root = { type: 'root', children: blocks.map((b) => b.node) };

    expect(blocks[0].node.type).toBe('wave');
    expect(stringifyMarkdown(root)).toContain(':::wave{speed="2"}');
  });

  it('setBlockSource keeps the block type', () => {
    const ast = parseMarkdown('> quote');
    const [block] = createEditorBlocks(ast);

    expect(block.node.type).toBe('blockquote');
    expect(getBlockSource(setBlockSource(block.node, 'new'))).toBe('new');
  });
});

describe('leaf mapping helpers', () => {
  it('maps source offset to dom offset through delimiters', () => {
    const leaves: Leaf[] = [
      { sourceStart: 2, sourceEnd: 7, domStart: 0, domEnd: 5 },
    ];

    expect(sourceOffsetToDomOffset(leaves, 0)).toBe(0);
    expect(sourceOffsetToDomOffset(leaves, 2)).toBe(0);
    expect(sourceOffsetToDomOffset(leaves, 5)).toBe(3);
    expect(sourceOffsetToDomOffset(leaves, 8)).toBe(5);
  });

  it('maps dom offset back to source offset', () => {
    const leaves: Leaf[] = [
      { sourceStart: 2, sourceEnd: 7, domStart: 0, domEnd: 5 },
    ];

    expect(domOffsetToSourceOffset(leaves, 0)).toBe(2);
    expect(domOffsetToSourceOffset(leaves, 3)).toBe(5);
    expect(domOffsetToSourceOffset(leaves, 5)).toBe(7);
  });

  it('round-trips through mixed leaves', () => {
    const source = 'a **b** c';
    const { leaves } = tokenizeInline(source);

    for (let offset = 0; offset <= source.length; offset++) {
      const dom = sourceOffsetToDomOffset(leaves, offset);
      const back = domOffsetToSourceOffset(leaves, dom);

      expect(back).toBeGreaterThanOrEqual(0);
      expect(back).toBeLessThanOrEqual(source.length);
    }
  });
});