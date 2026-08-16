
import type { ReactNode } from 'react';
import type { GlowNode } from './glowmark/nodes';
import { styles } from './glowmark/styles';

export function renderNode(
  node: GlowNode,
  key?: string | number,
): ReactNode {
  switch (node.type) {
    case 'text':
      return node.value;
    case 'paragraph':
      return (
        <p
          key={key}
          className={styles.paragraph}
        >
          {renderChildren(node.children)}
        </p>
      );
    case 'heading': {
      const Tag = `h${node.depth}` as
        | 'h1'
        | 'h2'
        | 'h3'
        | 'h4'
        | 'h5'
        | 'h6';

      return (
        <Tag
          key={key}
          className={
            styles.heading[node.depth] ??
            styles.heading[1]
          }
        >
          {renderChildren(node.children)}
        </Tag>
      );
    }

    case 'strong':
      return (
        <strong
          key={key}
          className={styles.strong}
        >
          {renderChildren(node.children)}
        </strong>
      );

    case 'emphasis':
      return (
        <em
          key={key}
          className={styles.emphasis}
        >
          {renderChildren(node.children)}
        </em>
      );

    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="border-l-2 pl-4 italic text-muted-foreground"
        >
          {renderChildren(node.children)}
        </blockquote>
      );


    case 'list': {
      const Tag = node.ordered ? 'ol' : 'ul';

      return (
        <Tag
          key={key}
          className="my-2 ml-6 list-outside space-y-1"
        >
          {node.children.map((child: any, index: string | number | undefined) =>
            renderNode(child as GlowNode, index),
          )}
        </Tag>
      );
    }
    case 'listItem':
      return (
        <li
          key={key}
          className="pl-1"
        >
          {renderChildren(node.children)}
        </li>
      );

    case 'inlineCode':
      return (
        <code
          key={key}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
        >
          {node.value}
        </code>
      );

    case 'code':
      return (
        <pre
          key={key}
          className="my-3 overflow-x-auto rounded-lg border bg-muted/50 p-4"
        >
          <code className="font-mono text-sm">
            {node.value}
          </code>
        </pre>
      );

 
    case 'link':
      return (
        <a
          key={key}
          href={node.url}
          title={node.title ?? undefined}
          className="text-primary underline underline-offset-4"
        >
          {renderChildren(node.children)}
        </a>
      );


    case 'image':
      return (
        <img
          key={key}
          src={node.url}
          alt={node.alt ?? ''}
          title={node.title ?? undefined}
          className="my-3 max-w-full rounded-lg"
        />
      );

  
    case 'thematicBreak':
      return (
        <hr
          key={key}
          className="my-6 border-border"
        />
      );

  
    case 'wave':
      return (
        <span
          key={key}
          data-glow-node="wave"
          data-speed={node.attributes?.speed}
          data-amplitude={node.attributes?.amplitude}
          className={styles.wave}
        >
          {renderChildren(node.children)}
        </span>
      );

  
    default:
      return renderFallback(node, key);
  }
}



function renderChildren(
  children: GlowNode[],
): ReactNode[] {
  return children.map((child, index) =>
    renderNode(child, index),
  );
}



function renderFallback(
  node: GlowNode,
  key?: string | number,
): ReactNode {
  if ('children' in node) {
    return (
      <div key={key}>
        {renderChildren(
          node.children as GlowNode[],
        )}
      </div>
    );
  }

  if ('value' in node) {
    return node.value;
  }

  return null;
}