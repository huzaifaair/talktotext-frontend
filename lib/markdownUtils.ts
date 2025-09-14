// lib/markdownUtils.ts
export function normalizeMarkdown(md: string): string {
  if (!md) return "";

  return md
    // convert **Heading** → ## Heading
    .replace(/^\*\*(.+)\*\*$/gm, "## $1")
    // ensure single * bullets are kept as - 
    .replace(/^\* /gm, "- ")
    // collapse too many newlines
    .replace(/\n{3,}/g, "\n\n");
}
