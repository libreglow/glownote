export const styles = {
  paragraph:
    "text-base leading-7",

  heading: {
    1: "text-4xl font-bold tracking-tight",
    2: "text-3xl font-bold tracking-tight",
    3: "text-2xl font-semibold tracking-tight",
    4: "text-xl font-semibold",
    5: "text-lg font-semibold",
    6: "text-base font-semibold",
  },

  strong:
    "font-bold",

  emphasis:
    "italic",

  wave:
    "inline-block",

  list:
    "my-2 pl-6",

  listItem:
    "my-1",

  blockquote:
    "border-l-4 pl-4 italic text-muted-foreground",

  code:
    "my-3 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm",

  inlineCode:
    "rounded bg-muted px-1.5 py-0.5 font-mono text-sm",

  link:
    "underline underline-offset-4",
} as const;