import { useState } from 'react';
import { parseMarkdown } from './glowmark/parser';
import type { GlowRoot } from './glowmark/nodes';
import Editor from './editor/editor';

const initialMarkdown = `# Hello

This is my first GlowNote document.

:::wave{speed="2"}
Hello World
:::
`;

export default function MarkdownEngine() {
  const [ast, setAst] = useState<GlowRoot>(() =>
    parseMarkdown(initialMarkdown),
  );

  return (
    <Editor
      ast={ast}
      onChange={(nextAst) => {
        setAst(nextAst);

        console.log('Updated AST:', nextAst);
      }}
    />
  );
}