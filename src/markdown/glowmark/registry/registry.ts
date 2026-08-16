import type { NodeDefinition } from "../nodes";

export class NodeRegistry {
  private readonly nodes = new Map<string, NodeDefinition>();

  register(definition: NodeDefinition): void {
    if (this.nodes.has(definition.type)) {
      throw new Error(
        `Node "${definition.type}" is already registered`
      );
    }

    this.nodes.set(definition.type, definition);
  }

  get(type: string): NodeDefinition | undefined {
    return this.nodes.get(type);
  }

  has(type: string): boolean {
    return this.nodes.has(type);
  }

  all(): NodeDefinition[] {
    return [...this.nodes.values()];
  }
}

export const nodeRegistry = new NodeRegistry();