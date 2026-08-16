import { useEffect, useRef } from "react";
import type { GlowNode } from "./nodes";
import { renderNode } from "./renderer";

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
    node.type === "paragraph" ||
    node.type === "heading";

  useEffect(() => {
    if (!ref.current) return;

    const text = getNodeText(node);

    if (ref.current.textContent !== text) {
      ref.current.textContent = text;
    }
  }, [node]);

  if (!editable) {
    return (
      <div>
        {renderNode(node)}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      className={
        node.type === "heading"
          ? "text-4xl font-bold outline-none"
          : "min-h-7 outline-none"
      }
      onInput={(event) => {
        onChange(event.currentTarget.textContent ?? "");
      }}
    />
  );
}

function getNodeText(node: GlowNode): string {
  if (!("children" in node)) {
    return "";
  }

  return node.children
    .map((child: { type: string; value: any; }) => {
      if (child.type === "text") {
        return child.value;
      }

      return getNodeText(child as GlowNode);
    })
    .join("");
}