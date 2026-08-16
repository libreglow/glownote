import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkDirective from "remark-directive";
import { transformGlowMark } from "./transform";

const parser = unified()
  .use(remarkParse)
  .use(remarkDirective);

export function parseMarkdown(markdown: string) {
  const tree = parser.parse(markdown);

  return transformGlowMark(tree);
}