# CONTEXT — `src/markdown/`

The markdown subsystem of GlowNote ("GlowMark"). It turns raw Markdown source
into an AST that the app can render/edit, and back into Markdown source for
disk persistence.

## System design (high level)

```
        markdown source
              │
              ▼
  parser.ts (unified + remark-parse + remark-directive)
              │  mdast Root
              ▼
  transform.ts (transformGlowMark — replaces custom directives with GlowMark nodes)
              │  GlowRoot (mdast + custom nodes)
              ▼
        ┌─────┴───────────┐
        ▼                 ▼
  serializer.ts      render/edit consumers
  (remark-stringify)  (markdown-editor.tsx → GlowEditor)
        │
        ▼
   markdown source
```

Design pillars:

- **Standard mdast as the AST.** The tree is a `Root` from the `mdast`
  package (`RootContent` children) with GlowMark extensions layered on top.
- **Custom nodes are Markdown directives.** `remark-directive` parses
  `:::name{attr="val"}` blocks; `transform.ts` converts registered custom
  directives into typed GlowMark nodes (e.g. `wave`) and `serializer.ts`
  writes them back out as directives.
- **Registry-driven.** Node metadata lives in `NodeRegistry` (singleton);
  both the transform and the serializer look up node definitions there, so
  adding a custom node = register it, no parser changes.
- **List round-trip.** The editor stores list items as *top-level blocks*
  (flat); the serializer re-groups adjacent same-ordering items into `list`
  nodes via `groupAdjacentLists` before stringifying.
- **Block source model (planned).** Per the tests, editor blocks keep raw
  markdown source separate from the parsed AST (`createEditorBlocks`,
  `updateBlockSource`, …), and inline text is tokenized with source↔DOM
  offset mapping so the caret survives formatting. This layer is designed
  and tested but not yet implemented on disk.

## Directory layout

```
src/markdown/
├── engine.tsx                     WIP scaffold; parses a hardcoded sample, logs AST
├── editor.tsx                     WIP stub; placeholder "test" div (typo: `Edit0r`)
└── glowmark/
    ├── index.ts                   empty barrel (0 lines)
    ├── nodes.ts                   AST + node-definition types
    ├── parser.ts                  markdown → GlowRoot
    ├── transform.ts               mdast → GlowMark custom nodes
    ├── serializer.ts              GlowRoot → markdown
    ├── styles.ts                  Tailwind class maps per node type
    └── registry/
        ├── registry.ts            NodeRegistry class + `nodeRegistry` singleton
        ├── builtins.ts            registers paragraph/heading/strong/emphasis/wave
        └── index.ts               barrel; importing it registers builtins
```

## Types (`glowmark/nodes.ts`)

- `GlowCustomNode` — union of custom node types; currently only `WaveNode`.
- `WaveNode` — `{ type: "wave"; attributes: { speed?, amplitude? };
  children: RootContent[] }`. A custom container directive.
- `GlowListItem extends ListItem` — `type: "listItem"` plus optional
  `ordered?: boolean` (carries the ordering of the list it was flattened
  from).
- `GlowNode` — `RootContent | GlowCustomNode`.
- `GlowRoot` — mdast `Root` whose children are `GlowNode[]`.
- `NodeCategory` — `"block" | "inline" | "container"`.
- `AttributeType` — `"string" | "number" | "boolean"`.
- `AttributeDefinition` — `{ type; required?; default? }`.
- `NodeDefinition` — full node metadata contract:
  `type` (unique id), `category`, `name?`, `description?`, `children?`,
  `attributes?`, `allowedIn?`, `allowedChildren?`, `inline?`, `block?`,
  `custom?` (true = GlowMark custom node), `version?` (future AST
  migrations).

## Functions

### `glowmark/parser.ts`

- `parseMarkdown(markdown: string): GlowRoot` — parses with the shared
  `unified()` pipeline (`remark-parse` + `remark-directive`), then runs
  `transformGlowMark` and returns the tree.

### `glowmark/transform.ts`

- `transformGlowMark(tree: Root)` — in-place traversal; converts
  `containerDirective` children whose name is a registered `custom` node
  into `{ type, attributes, children }` GlowMark nodes. Non-custom
  directives stay as `containerDirective`.
- `visit(node)` — internal recursive walker. Note: when a child is
  converted it `continue`s (skips descending into the converted node);
  otherwise recurses into children.

### `glowmark/serializer.ts`

- `stringifyMarkdown(tree: GlowRoot): string` — wraps children with
  `groupAdjacentLists`, then `unified().use(remarkStringify, { handlers })`
  stringifies.
- `directiveHandler(node, parent, state, info)` — serializes custom nodes /
  `containerDirective` back to `:::name{key="value"}\n<body>\n:::`.
  `name` falls back to `type`.
- `groupAdjacentLists(children: GlowNode[]): GlowNode[]` — merges runs of
  adjacent `listItem`s with matching `ordered` flag into `list` nodes;
  `spread` = any item has >1 child. Required because the editor stores list
  items as top-level blocks.

### `glowmark/registry/registry.ts`

- `NodeRegistry.register(definition)` — throws if type already registered.
- `NodeRegistry.get(type)` — returns definition or `undefined`.
- `NodeRegistry.has(type)` — boolean.
- `NodeRegistry.all()` — all definitions as array.
- `nodeRegistry` — module-level singleton instance.

### `glowmark/registry/builtins.ts`

Side-effect module (imported by `registry/index.ts`); registers builtins:

| type      | category  | custom |
|-----------|-----------|--------|
| paragraph | block     |        |
| heading   | block     |        |
| strong    | inline    |        |
| emphasis  | inline    |        |
| wave      | container | ✓      |

### `glowmark/styles.ts`

- `styles` — `as const` map of Tailwind classes per node: `heading[1..6]`,
  `paragraph`, `strong`, `emphasis`, `wave` (`inline-block`).

### `markdown/engine.tsx`

- `MarkdownEngine` — debug scaffold; parses a hardcoded sample containing a
  `:::wave{speed="2"}` directive, logs `ast.children`, renders a static
  `<p>hello</p>`. Not wired to any route.

### `markdown/editor.tsx`

- `Edit0r` — placeholder component rendering a "test" div. Not wired up.

## Integration with the app

- `src/components/modules/markdown-editor.tsx` is the real consumer: loads
  the document via the `readDocument` Tauri command, `parseMarkdown` → AST,
  renders `<GlowEditor ast onChange>` (planned editor component), and on
  change sets `isDirty` and debounces `saveDocument` (500 ms) with
  `stringifyMarkdown(nextAst)`.
- Markdown is stored as files on disk (`~/Documents/glownote/projects/
  {projectId}/pages/{id}.md`), so parse/serialize must be a lossless
  round-trip.

## Known gaps / discrepancies

- `src/test/*.test.ts` (vitest) import a `glowmark/editor/` submodule that
  does **not exist on disk** yet: `Editor` (component), `EditorState`
  (`createEditorBlocks`, `getBlockChildren`, `getBlockSource`,
  `isEditableBlock`, `setBlockSource`, `updateBlockSource`),
  `inline/tokenizer` (`tokenizeInline`, `Leaf`),
  `inline/serialize` (`serializeInline`), `inline/ast` (`splitInlineNodes`,
  `inlineNodesEqual`), `selection` (`sourceOffsetToDomOffset`,
  `domOffsetToSourceOffset`), `input/keyboard`.
- `markdown-editor.tsx:6` imports `GlowEditor` from that missing module —
  the build currently fails on it.
- `glowmark/index.ts` is empty; `engine.tsx`/`editor.tsx` are unfinished
  scaffolds.
- `AGENTS.md` says no tests exist, but `src/test/` now has vitest suites
  (they document the intended editor architecture above).