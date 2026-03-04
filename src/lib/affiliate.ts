export const AFFILIATE_CODE_REGEX = /^[A-Z0-9_-]{3,32}$/;

export function normalizeAffiliateCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  if (!normalized) return null;
  if (!AFFILIATE_CODE_REGEX.test(normalized)) return null;
  return normalized;
}
