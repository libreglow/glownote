import { nodeRegistry } from "./registry";

nodeRegistry.register({
  type: "paragraph",
  category: "block",
});

nodeRegistry.register({
  type: "heading",
  category: "block",
});

nodeRegistry.register({
  type: "strong",
  category: "inline",
});

nodeRegistry.register({
  type: "emphasis",
  category: "inline",
});

nodeRegistry.register({
  type: "wave",
  category: "container",
  custom: true,
});