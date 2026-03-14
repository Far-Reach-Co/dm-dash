import { srdData } from "./data.js";

export type SearchContextHint = {
  path?: string | null;
  category?: string | null;
  index?: string | null;
  title?: string | null;
};

export type NormalizedSearchContext = {
  path: string | null;
  category: string | null;
  index: string | null;
  title: string | null;
};

const SRD_PATH_PREFIX = "/dnd/5e/srd/";
const NON_DETAIL_SUBROUTES: Record<string, ReadonlySet<string>> = {
  spells: new Set(["level", "school", "class", "damage"]),
  monsters: new Set(["type", "cr", "condition-immunity"]),
};

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.length) return null;
  return trimmed.slice(0, maxLength);
}

export function normalizeSrdPath(value: unknown): string | null {
  const raw = normalizeText(value, 240);
  if (!raw) return null;

  const normalized = raw.split(/[?#]/)[0].replace(/\/+$/, "");
  if (!normalized.startsWith(SRD_PATH_PREFIX)) return null;
  return normalized;
}

export function normalizeSrdCategory(value: unknown): string | null {
  const key = normalizeText(value, 80)?.toLowerCase() || null;
  if (!key) return null;
  if (Object.prototype.hasOwnProperty.call(srdData, key)) return key;
  return null;
}

export function parseSrdPathContext(path: string): {
  category: string | null;
  index: string | null;
} {
  const normalizedPath = normalizeSrdPath(path);
  if (!normalizedPath) {
    return { category: null, index: null };
  }

  const segments = normalizedPath.split("/").filter(Boolean).slice(3);
  const category = normalizeSrdCategory(segments[0] || "");
  if (!category || segments.length < 2) {
    return { category, index: null };
  }

  const candidateIndex = normalizeText(segments[1], 120)?.toLowerCase() || null;
  if (!candidateIndex) return { category, index: null };

  const deniedSubroutes = NON_DETAIL_SUBROUTES[category];
  if (deniedSubroutes && deniedSubroutes.has(candidateIndex)) {
    return { category, index: null };
  }

  return { category, index: candidateIndex };
}

export function normalizeSearchContextHint(
  context?: SearchContextHint,
): NormalizedSearchContext | null {
  if (!context) return null;

  const path = normalizeSrdPath(context.path);
  const fromPath = path ? parseSrdPathContext(path) : { category: null, index: null };
  const category = normalizeSrdCategory(context.category) || fromPath.category;
  const index =
    normalizeText(context.index, 120)?.toLowerCase() || fromPath.index;
  const title = normalizeText(context.title, 120);

  if (!path && !category && !index && !title) return null;
  return {
    path: path || null,
    category: category || null,
    index: index || null,
    title: title || null,
  };
}
