import type { ListItem, Root, RootContent } from "mdast";

export type GlowCustomNode =
  | WaveNode;

export interface WaveNode {
  type: "wave";
  attributes: {
    speed?: string;
    amplitude?: string;
  };
  children: RootContent[];
}

/**
 * A list item carrying the ordering of the list it was flattened from.
 *
 * The editor stores list items as top-level blocks; the serializer groups
 * adjacent items back into a `list` node on output.
 */
export interface GlowListItem extends ListItem {
  type: "listItem";
  ordered?: boolean;
}

export type GlowNode =
  | RootContent
  | GlowCustomNode;

export type GlowRoot = Omit<Root, "children"> & {
  children: GlowNode[];
};

export type NodeCategory =
  | "block"
  | "inline"
  | "container";

export type AttributeType =
  | "string"
  | "number"
  | "boolean";

export interface AttributeDefinition {
  type: AttributeType;
  required?: boolean;
  default?: string | number | boolean;
}

export interface NodeDefinition {
  /**
   * Unique node identifier.
   *
   * Example:
   * "paragraph"
   * "heading"
   * "wave"
   */
  type: string;

  /**
   * Node category.
   */
  category: NodeCategory;

  /**
   * Human-readable name.
   */
  name?: string;

  /**
   * Description of what this node represents.
   */
  description?: string;

  /**
   * Whether the node can contain child nodes.
   */
  children?: boolean;

  /**
   * Attributes supported by this node.
   */
  attributes?: Record<string, AttributeDefinition>;

  /**
   * Whether this node can appear inside another node.
   */
  allowedIn?: string[];

  /**
   * Whether this node is allowed to contain specific nodes.
   */
  allowedChildren?: string[];

  /**
   * Whether this node is considered an inline node.
   */
  inline?: boolean;

  /**
   * Whether this node is considered a block node.
   */
  block?: boolean;

  /**
   * Whether this is a custom GlowMark node.
   */
  custom?: boolean;

  /**
   * Optional version for future AST migrations.
   */
  version?: number;
}