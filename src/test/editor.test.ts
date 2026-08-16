import { describe, expect, it } from 'vitest';
import { parseMarkdown } from '../markdown/glowmark/parser';
import { stringifyMarkdown } from '../markdown/glowmark/serializer';
import {
  buildGlowRoot,
  createParagraph,
  getBlockText,
  setBlockText,
  isEditableBlock,
} from '../markdown/glowmark/editor/EditorState';
import { nodeRegistry } from '../markdown/glowmark/registry';

describe('glowmark pipeline', () => {
  it('parses markdown into editable blocks', () => {
    const ast = parseMarkdown(
      '# Hello\n\nWorld\n\n:::wave{speed="2"}\nWave body\n:::',
    );
    expect(isEditableBlock(ast.children[0])).toBe(true);
    expect(getBlockText(ast.children[0])).toBe('Hello');
    expect(getBlockText(ast.children[1])).toBe('World');
    expect(ast.children[2].type).toBe('wave');
    expect(nodeRegistry.get('wave')?.custom).toBe(true);
  });

  it('serializes custom wave nodes as directives', () => {
    const ast = parseMarkdown('# Hello\n\n:::wave{speed="2"}\nWave body\n:::');
    const out = stringifyMarkdown(ast);
    expect(out).toContain(':::wave{speed="2"}');
    expect(out).toContain('Wave body');
    expect(out).toContain('# Hello');
    const again = parseMarkdown(out);
    expect(again.children.map((c) => c.type)).toEqual(['heading', 'wave']);
  });

  it('round-trips edited blocks', () => {
    const ast = parseMarkdown('Hello world');
    const block = ast.children[0];
    const edited = setBlockText(block, 'Hello again');
    const root = buildGlowRoot([edited]);
    expect(stringifyMarkdown(root)).toContain('Hello again');
    expect(stringifyMarkdown(root)).not.toContain('Hello world');
  });

  it('creates split paragraphs for Enter', () => {
    const before = createParagraph('Hello');
    const after = createParagraph('world');
    const root = buildGlowRoot([before, after]);
    expect(stringifyMarkdown(root)).toContain('Hello\n\nworld');
  });
});
