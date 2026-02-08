const BASE_URL = "https://farreachco.com";

/**
 * Converts markdown to plain text suitable for VTT chat.
 * - Markdown links [Text](/path) → Text - https://farreachco.com/path
 * - Strips heading markers, bold/italic markers, inline code backticks
 * - Preserves line breaks and list markers as-is
 */
export function markdownToChat(md: string): string {
  return (
    md
      // Convert markdown links with relative URLs to full URLs
      .replace(
        /\[([^\]]+)\]\(\/([^)]*)\)/g,
        `$1 - ${BASE_URL}/$2`,
      )
      // Convert markdown links with absolute URLs (keep as-is)
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        "$1 - $2",
      )
      // Strip heading markers
      .replace(/^#{1,6}\s+/gm, "")
      // Strip bold/italic markers
      .replace(/(\*{1,3}|_{1,3})(.+?)\1/g, "$2")
      // Strip inline code backticks
      .replace(/`([^`]+)`/g, "$1")
  );
}
