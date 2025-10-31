// lib/markdownUtils.ts
export function normalizeMarkdown(md: string): string {
  if (!md) return "";

  return (
    md
      // fix misplaced bold headings like **Heading**
      .replace(/^\s*\*\*(.+?)\*\*\s*$/gm, "## $1")

      // normalize heading spacing (## -> newline before)
      .replace(/(## .+)/g, "\n$1\n")

      // ensure list items have a single dash and space
      .replace(/^\s*[-*]\s*/gm, "- ")

      // remove triple blank lines
      .replace(/\n{3,}/g, "\n\n")

      // trim excess spaces
      .trim()
  );
}
