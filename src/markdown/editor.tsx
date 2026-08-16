import type { JSX, ReactNode } from "react";
import type { GlowNode, GlowRoot } from "./glowmark/nodes";
import { styles } from "./glowmark/styles";

interface GlowRendererProps {
  ast: GlowRoot;
}

export function GlowRenderer({ ast }: GlowRendererProps) {
  return (
    <div className="glow-document">
      {ast.children.map((node, index) =>
        renderNode(node as GlowNode, index)
      )}
    </div>
  );
}

export function renderNode(
  node: GlowNode,
  key?: number
): ReactNode {
  switch (node.type) {
    case "text":
      return node.value;

    case "paragraph":
      return (
        <p
          key={key}
          className={styles.paragraph}
        >
          {renderChildren(node.children)}
        </p>
      );

    case "heading": {
      const Tag = `h${node.depth}` as keyof JSX.IntrinsicElements;

      return (
        <Tag
          key={key}
          className={styles.heading[node.depth]}
        >
          {renderChildren(node.children)}
        </Tag>
      );
    }

    case "strong":
      return (
        <strong
          key={key}
          className={styles.strong}
        >
          {renderChildren(node.children)}
        </strong>
      );

    case "emphasis":
      return (
        <em
          key={key}
          className={styles.emphasis}
        >
          {renderChildren(node.children)}
        </em>
      );

    case "wave":
      return (
        <span
          key={key}
          className={styles.wave}
          data-wave
          data-speed={node.attributes?.speed}
          data-amplitude={node.attributes?.amplitude}
        >
          {renderChildren(node.children)}
        </span>
      );

    case "list":
      return node.ordered ? (
        <ol key={key} className={styles.list}>
          {renderChildren(node.children)}
        </ol>
      ) : (
        <ul key={key} className={styles.list}>
          {renderChildren(node.children)}
        </ul>
      );

    case "listItem":
      return (
        <li
          key={key}
          className={styles.listItem}
        >
          {renderChildren(node.children)}
        </li>
      );

    case "blockquote":
      return (
        <blockquote
          key={key}
          className={styles.blockquote}
        >
          {renderChildren(node.children)}
        </blockquote>
      );

    case "code":
      return (
        <pre
          key={key}
          className={styles.code}
        >
          <code>{node.value}</code>
        </pre>
      );

    case "inlineCode":
      return (
        <code
          key={key}
          className={styles.inlineCode}
        >
          {node.value}
        </code>
      );

    case "thematicBreak":
      return <hr key={key} />;

    case "link":
      return (
        <a
          key={key}
          href={node.url}
          className={styles.link}
        >
          {renderChildren(node.children)}
        </a>
      );

    case "delete":
      return (
        <del key={key}>
          {renderChildren(node.children)}
        </del>
      );

    case "break":
      return <br key={key} />;

    default:
      if ("children" in node) {
        return (
          <span key={key}>
            {renderChildren(node.children)}
          </span>
        );
      }

      return null;
  }
}

function renderChildren(
  children: readonly GlowNode[]
): ReactNode[] {
  return children.map((child, index) =>
    renderNode(child, index)
  );
}