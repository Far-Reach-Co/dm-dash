export function parseFlagValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

export function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

export function parseIntFlag(
  flag: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = parseFlagValue(flag);
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}
