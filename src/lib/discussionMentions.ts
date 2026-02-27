const MENTION_PATTERN = /(^|\s)@([a-zA-Z0-9_][a-zA-Z0-9_-]{1,31})/g;

export function extractMentionUsernames(content: string): string[] {
  const normalized = String(content || "");
  const seen = new Set<string>();
  let match: RegExpExecArray | null = null;
  while ((match = MENTION_PATTERN.exec(normalized)) !== null) {
    const username = String(match[2] || "").trim();
    if (!username) continue;
    const key = username.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
  }
  return [...seen];
}
