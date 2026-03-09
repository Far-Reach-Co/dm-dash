import { Mistral } from "@mistralai/mistralai";
import { detectCategories, srdData } from "./data.js";
import { findRelevantEntries } from "./indexer.js";
import { SERIALIZERS, serializeGeneric } from "./serializers.js";
import { getSpellsForClass } from "../srdCatalog.js";
import { redisClient } from "../../lib/socketUsers.js";
import {
  normalizeSearchContextHint,
  type SearchContextHint,
  type NormalizedSearchContext,
} from "./context.js";

// ── Mistral API ───────────────────────────────────────────────────────────────

function extractSpellIndexesFromTraitSpecific(node: any, out: Set<string>) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const item of node) extractSpellIndexesFromTraitSpecific(item, out);
    return;
  }
  if (typeof node !== "object") return;

  const candidateItem = (node as any).item;
  if (candidateItem && typeof candidateItem === "object") {
    const index = String(candidateItem.index || "").trim().toLowerCase();
    const url = String(candidateItem.url || "").trim().toLowerCase();
    if (index && url.includes("/spells/")) {
      out.add(index);
    }
  }

  for (const value of Object.values(node)) {
    extractSpellIndexesFromTraitSpecific(value, out);
  }
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function traitReferencesSpell(
  trait: any,
  spellIndex: string,
  spellName: string,
): boolean {
  const spellIndexes = new Set<string>();
  extractSpellIndexesFromTraitSpecific(trait?.trait_specific, spellIndexes);
  if (spellIndexes.has(spellIndex)) return true;

  const descText = Array.isArray(trait?.desc)
    ? trait.desc.join(" ")
    : String(trait?.desc || "");
  const normalizedDesc = descText.toLowerCase();
  if (!normalizedDesc) return false;

  const namePattern = new RegExp(`\\b${escapeForRegex(spellName.toLowerCase())}\\b`, "i");
  if (!namePattern.test(normalizedDesc)) return false;
  return /\b(cast|know|learn|prepared|spell|cantrip)\b/i.test(normalizedDesc);
}

function getSpellRaceAccess(spellIndex: string, spellName: string): {
  races: string[];
  subraces: string[];
} {
  const raceNameByIndex = new Map<string, string>();
  for (const race of srdData.races || []) {
    const index = String(race?.index || "").trim().toLowerCase();
    if (!index) continue;
    const name = String(race?.name || index).trim();
    raceNameByIndex.set(index, name);
  }

  const subraceLabelByIndex = new Map<string, string>();
  for (const subrace of srdData.subraces || []) {
    const index = String(subrace?.index || "").trim().toLowerCase();
    if (!index) continue;
    const subraceName = String(subrace?.name || index).trim();
    const raceName = String(
      subrace?.race?.name || raceNameByIndex.get(String(subrace?.race?.index || "").toLowerCase()) || "",
    ).trim();
    const label = raceName ? `${subraceName} (${raceName})` : subraceName;
    subraceLabelByIndex.set(index, label);
  }

  const races = new Set<string>();
  const subraces = new Set<string>();
  for (const trait of srdData.traits || []) {
    if (!traitReferencesSpell(trait, spellIndex, spellName)) continue;

    for (const raceRef of trait?.races || []) {
      const index = String(raceRef?.index || "").trim().toLowerCase();
      if (!index) continue;
      races.add(raceNameByIndex.get(index) || String(raceRef?.name || index));
    }
    for (const subraceRef of trait?.subraces || []) {
      const index = String(subraceRef?.index || "").trim().toLowerCase();
      if (!index) continue;
      subraces.add(subraceLabelByIndex.get(index) || String(subraceRef?.name || index));
    }
  }

  return {
    races: Array.from(races).sort((a, b) => a.localeCompare(b)),
    subraces: Array.from(subraces).sort((a, b) => a.localeCompare(b)),
  };
}

function buildPageContextBlock(context: NormalizedSearchContext | null): string | null {
  if (!context) return null;

  const lines: string[] = [];
  if (context.path) lines.push(`Path: ${context.path}`);
  if (context.category) lines.push(`Category: ${context.category}`);

  let focusedEntry: any | null = null;
  let focusedEntryName: string | null = null;
  if (context.category && context.index) {
    const category = context.category;
    const entry = (srdData[category] || []).find(
      (value: any) => String(value?.index || "").toLowerCase() === context.index,
    );
    if (entry) {
      focusedEntry = entry;
      focusedEntryName = String(entry?.name || "").trim() || null;
      const serializer =
        SERIALIZERS[category] ||
        ((value: any) => serializeGeneric(value, category.toUpperCase()));
      lines.push(`Focused entry index: ${context.index}`);
      lines.push(serializer(entry).slice(0, 1400));
    }
  }

  if (context.category === "classes" && context.index) {
    const classSpells = getSpellsForClass(context.index);
    const classLabel = focusedEntryName || context.index;
    if (classSpells.length) {
      const examples = classSpells
        .slice(0, 25)
        .map((spell: any) => spell?.name)
        .filter(Boolean)
        .join(", ");
      lines.push(`Class spell list for ${classLabel}: ${classSpells.length} spell(s) in SRD.`);
      if (examples) lines.push(`Class spell examples: ${examples}`);
    } else {
      lines.push(`Class spell list for ${classLabel}: none in the SRD base class spell list.`);
    }
  }
  if (context.category === "spells" && context.index && focusedEntry) {
    const classNames = (focusedEntry?.classes || [])
      .map((cls: any) => String(cls?.name || cls?.index || "").trim())
      .filter(Boolean);
    const subclassNames = (focusedEntry?.subclasses || [])
      .map((subclass: any) => String(subclass?.name || subclass?.index || "").trim())
      .filter(Boolean);
    const spellName = String(focusedEntry?.name || context.index).trim();
    const raceAccess = getSpellRaceAccess(context.index, spellName);

    lines.push(
      classNames.length
        ? `Spell users (classes): ${classNames.join(", ")}.`
        : "Spell users (classes): none listed in SRD.",
    );
    if (subclassNames.length) {
      lines.push(`Spell users (subclasses): ${subclassNames.join(", ")}.`);
    }
    if (raceAccess.races.length || raceAccess.subraces.length) {
      if (raceAccess.races.length) {
        lines.push(`Spell users (races): ${raceAccess.races.join(", ")}.`);
      }
      if (raceAccess.subraces.length) {
        lines.push(`Spell users (subraces): ${raceAccess.subraces.join(", ")}.`);
      }
    }
  }

  if (!lines.length) return null;
  return lines.join("\n");
}

function getClient(): Mistral {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not configured");
  }
  return new Mistral({ apiKey });
}

async function queryMistral(
  question: string,
  context: string,
  short = false,
  pageContext: string | null = null,
): Promise<string> {
  const client = getClient();

  let systemPrompt: string;
  let maxTokens: number;

  const pageContextSection = pageContext
    ? `--- CURRENT PAGE CONTEXT ---\n${pageContext}\n\n`
    : "";

  if (short) {
    systemPrompt =
      `You are a D&D 5e rules assistant replying inside a Discord message. ` +
      `Answer in 2-3 sentences using ONLY the SRD reference data provided. ` +
      `If CURRENT PAGE CONTEXT is provided, use it as the default scope unless the user explicitly names another entity. ` +
      `Be direct and specific. Do NOT use markdown links. Do NOT use bullet lists. ` +
      `If the data is insufficient, say so in one sentence.\n\n` +
      pageContextSection +
      `--- SRD REFERENCE DATA ---\n${context}`;
    maxTokens = 300;
  } else {
    const srdLinkReference = getSrdLinkReference();
    systemPrompt =
      `You are a knowledgeable D&D 5th Edition rules assistant. Answer the user's question using ONLY the SRD reference data provided below. ` +
      `If CURRENT PAGE CONTEXT is provided, treat it as the default scope unless the user explicitly names another entity. ` +
      `Be specific, cite names and stats when relevant, and keep answers concise. ` +
      `If the data doesn't contain enough information to answer, say so honestly and provide a helpful suggestion to the user about where they might find more information.\n\n` +
      `FORMATTING RULES:\n` +
      `- When listing items, include a MAXIMUM of 15 items. If more exist, mention how many total and suggest the user browse the full list.\n` +
      `- Use markdown links for SRD pages whenever relevant and available.\n` +
      `- Detail page patterns: spells → /dnd/5e/srd/spells/{index}, monsters → /dnd/5e/srd/monsters/{index}, equipment → /dnd/5e/srd/equipment/{index}, magic items → /dnd/5e/srd/magic-items/{index}, classes → /dnd/5e/srd/classes/{index}, races → /dnd/5e/srd/races/{index}, backgrounds → /dnd/5e/srd/backgrounds/{index}, features → /dnd/5e/srd/features/{index}\n` +
      `- You may also link to spell filter pages and monster filter pages when useful.\n` +
      `- Only generate links that match the allowed SRD URL reference below.\n\n` +
      `ALLOWED SRD URL REFERENCE:\n${srdLinkReference}\n\n` +
      pageContextSection +
      `--- SRD REFERENCE DATA ---\n${context}`;
    maxTokens = 1024;
  }

  const response = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    temperature: 0.3,
    maxTokens,
  });

  return (
    (response.choices?.[0]?.message?.content as string) ||
    "No answer generated."
  );
}

// ── Redis cache ──────────────────────────────────────────────────────────────

const CACHE_PREFIX = "srd-search:";
const CACHE_TTL = 60 * 60; // 1 hour in seconds

function getContextSignature(context: NormalizedSearchContext | null): string {
  if (!context) return "global";
  const parts: string[] = [];
  if (context.path) parts.push(`p=${context.path}`);
  if (context.category) parts.push(`c=${context.category}`);
  if (context.index) parts.push(`i=${context.index}`);
  if (!parts.length) return "global";
  return parts.join("|");
}

function cacheKey(query: string, short: boolean, context: NormalizedSearchContext | null): string {
  const base = CACHE_PREFIX + (short ? "short:" : "") + query.toLowerCase().trim();
  const signature = getContextSignature(context);
  if (signature === "global") return base;
  return `${base}:ctx:${Buffer.from(signature).toString("base64url")}`;
}

async function getCached(
  query: string,
  short: boolean,
  context: NormalizedSearchContext | null,
): Promise<string | null> {
  try {
    return await redisClient.get(cacheKey(query, short, context));
  } catch {
    return null;
  }
}

async function setCache(
  query: string,
  answer: string,
  short: boolean,
  context: NormalizedSearchContext | null,
): Promise<void> {
  try {
    await redisClient.setEx(cacheKey(query, short, context), CACHE_TTL, answer);
  } catch {
    // Cache write failure is non-fatal
  }
}

// ── Link sanitizer ───────────────────────────────────────────────────────────

const LINKABLE_DETAIL_CATEGORIES: Record<string, string> = {
  spells: "/dnd/5e/srd/spells/",
  monsters: "/dnd/5e/srd/monsters/",
  equipment: "/dnd/5e/srd/equipment/",
  "magic-items": "/dnd/5e/srd/magic-items/",
  classes: "/dnd/5e/srd/classes/",
  races: "/dnd/5e/srd/races/",
  backgrounds: "/dnd/5e/srd/backgrounds/",
  features: "/dnd/5e/srd/features/",
};

const STATIC_LINKABLE_PATHS = new Set<string>([
  "/dnd/5e/srd/contents",
  "/dnd/5e/srd/spells",
  "/dnd/5e/srd/monsters",
  "/dnd/5e/srd/equipment",
  "/dnd/5e/srd/classes",
  "/dnd/5e/srd/races",
  "/dnd/5e/srd/backgrounds",
  "/dnd/5e/srd/ability-scores",
  "/dnd/5e/srd/alignments",
  "/dnd/5e/srd/conditions",
  "/dnd/5e/srd/damage-types",
  "/dnd/5e/srd/feats",
  "/dnd/5e/srd/features",
  "/dnd/5e/srd/languages",
  "/dnd/5e/srd/skills",
  "/dnd/5e/srd/weapon-properties",
]);

const MAX_AUTO_LINKS = 18;

let validPaths: Set<string> | null = null;
let srdLinkReferenceCache: string | null = null;
let autoLinkTargetsCache: Array<{ path: string; pattern: RegExp }> | null = null;

function toMonsterTypeSlug(typeName: string): string {
  return String(typeName)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toCrSlug(crValue: string): string {
  if (crValue === "0.125") return "1-8";
  if (crValue === "0.25") return "1-4";
  if (crValue === "0.5") return "1-2";
  return crValue;
}

function crSlugToNumeric(crSlug: string): number {
  if (crSlug === "1-8") return 0.125;
  if (crSlug === "1-4") return 0.25;
  if (crSlug === "1-2") return 0.5;
  const parsed = Number(crSlug);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function generateFilterPaths(): Set<string> {
  const paths = new Set<string>();
  const spellLevels = new Set<string>();
  const spellSchools = new Set<string>();
  const spellClasses = new Set<string>();
  const monsterTypes = new Set<string>();
  const monsterCrs = new Set<string>();

  for (const spell of srdData.spells || []) {
    if (spell?.level !== undefined && spell?.level !== null) {
      spellLevels.add(String(spell.level));
    }
    if (spell?.school?.index) {
      spellSchools.add(String(spell.school.index));
    }
    for (const cls of spell.classes || []) {
      if (cls?.index) spellClasses.add(String(cls.index));
    }
  }

  for (const monster of srdData.monsters || []) {
    if (monster?.type) {
      monsterTypes.add(toMonsterTypeSlug(monster.type));
    }
    if (monster?.challenge_rating !== undefined && monster?.challenge_rating !== null) {
      monsterCrs.add(toCrSlug(String(monster.challenge_rating)));
    }
  }

  for (const level of spellLevels) {
    paths.add(`/dnd/5e/srd/spells/level/${level}`);
  }
  for (const school of spellSchools) {
    paths.add(`/dnd/5e/srd/spells/school/${school}`);
  }
  for (const cls of spellClasses) {
    paths.add(`/dnd/5e/srd/spells/class/${cls}`);
  }
  for (const typeSlug of monsterTypes) {
    paths.add(`/dnd/5e/srd/monsters/type/${typeSlug}`);
  }
  for (const crSlug of monsterCrs) {
    paths.add(`/dnd/5e/srd/monsters/cr/${crSlug}`);
  }

  return paths;
}

function getSrdLinkReference(): string {
  if (srdLinkReferenceCache) return srdLinkReferenceCache;

  const spellSchoolIndexes = Array.from(
    new Set((srdData.spells || []).map((s) => s?.school?.index).filter(Boolean)),
  ).sort();
  const spellClassIndexes = Array.from(
    new Set(
      (srdData.spells || []).flatMap((s) =>
        (s?.classes || []).map((cls: any) => cls?.index).filter(Boolean),
      ),
    ),
  ).sort();
  const monsterTypeSlugs = Array.from(
    new Set((srdData.monsters || []).map((m) => toMonsterTypeSlug(m?.type)).filter(Boolean)),
  ).sort();
  const monsterCrSlugs = Array.from(
    new Set(
      (srdData.monsters || [])
        .map((m) => m?.challenge_rating)
        .filter((v) => v !== undefined && v !== null)
        .map((v) => toCrSlug(String(v))),
    ),
  ).sort((a, b) => crSlugToNumeric(a) - crSlugToNumeric(b));

  srdLinkReferenceCache = [
    "- Core indexes: /dnd/5e/srd/contents, /dnd/5e/srd/spells, /dnd/5e/srd/monsters, /dnd/5e/srd/equipment, /dnd/5e/srd/classes, /dnd/5e/srd/races, /dnd/5e/srd/backgrounds",
    "- Feature detail pattern: /dnd/5e/srd/features/{index}",
    "- Spell filter pattern: /dnd/5e/srd/spells/level/{0-9}",
    `- Spell school filter pattern: /dnd/5e/srd/spells/school/{index} where index in [${spellSchoolIndexes.join(", ")}]`,
    `- Spell class filter pattern: /dnd/5e/srd/spells/class/{index} where index in [${spellClassIndexes.join(", ")}]`,
    `- Monster type filter pattern: /dnd/5e/srd/monsters/type/{slug} where slug in [${monsterTypeSlugs.join(", ")}]`,
    `- Monster CR filter pattern: /dnd/5e/srd/monsters/cr/{slug} where slug in [${monsterCrSlugs.join(", ")}]`,
  ].join("\n");

  return srdLinkReferenceCache;
}

function getValidPaths(): Set<string> {
  if (validPaths) return validPaths;

  const paths = new Set<string>();
  for (const [category, prefix] of Object.entries(LINKABLE_DETAIL_CATEGORIES)) {
    for (const entry of srdData[category] || []) {
      if (entry.index) paths.add(prefix + entry.index);
    }
  }
  for (const path of STATIC_LINKABLE_PATHS) {
    paths.add(path);
  }
  for (const path of generateFilterPaths()) {
    paths.add(path);
  }
  validPaths = paths;
  return validPaths;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getAutoLinkTargets(): Array<{ path: string; pattern: RegExp }> {
  if (autoLinkTargetsCache) return autoLinkTargetsCache;

  const byName = new Map<string, { name: string; paths: Set<string> }>();
  for (const [category, prefix] of Object.entries(LINKABLE_DETAIL_CATEGORIES)) {
    for (const entry of srdData[category] || []) {
      const name = String(entry?.name || "").trim();
      const index = String(entry?.index || "").trim();
      if (!name || !index) continue;

      const key = name.toLowerCase();
      const path = `${prefix}${index}`;
      const existing = byName.get(key);
      if (existing) {
        existing.paths.add(path);
      } else {
        byName.set(key, { name, paths: new Set([path]) });
      }
    }
  }

  autoLinkTargetsCache = Array.from(byName.values())
    .filter((item) => item.paths.size === 1)
    .map((item) => {
      const [path] = Array.from(item.paths);
      return {
        path,
        // Case-sensitive match reduces accidental linking of generic lowercase words.
        pattern: new RegExp(
          `(^|[^A-Za-z0-9])(${escapeRegExp(item.name)})(?=[^A-Za-z0-9]|$)`,
          "g",
        ),
      };
    })
    .sort((a, b) => b.pattern.source.length - a.pattern.source.length);

  return autoLinkTargetsCache;
}

function protectMarkdownSegments(markdown: string): {
  text: string;
  tokens: Map<string, string>;
} {
  const tokens = new Map<string, string>();
  let cursor = 0;

  const protect = (source: string, pattern: RegExp): string =>
    source.replace(pattern, (segment) => {
      const token = `@@SRD_TOKEN_${cursor++}@@`;
      tokens.set(token, segment);
      return token;
    });

  let protectedText = markdown;
  protectedText = protect(protectedText, /```[\s\S]*?```/g);
  protectedText = protect(protectedText, /`[^`\n]*`/g);
  protectedText = protect(protectedText, /\[[^\]]+\]\((?:[^)(]+|\([^)]*\))*\)/g);

  return { text: protectedText, tokens };
}

function restoreMarkdownSegments(
  markdown: string,
  tokens: Map<string, string>,
): string {
  let restored = markdown;
  for (const [token, original] of tokens.entries()) {
    restored = restored.split(token).join(original);
  }
  return restored;
}

function addDeterministicLinks(markdown: string): string {
  const validPaths = getValidPaths();
  const targets = getAutoLinkTargets().filter((target) => validPaths.has(target.path));
  const protectedDoc = protectMarkdownSegments(markdown);
  let nextText = protectedDoc.text;
  let linksAdded = 0;

  for (const target of targets) {
    if (linksAdded >= MAX_AUTO_LINKS) break;
    let linkedThisTarget = false;
    nextText = nextText.replace(
      target.pattern,
      (match: string, prefix: string, entity: string) => {
        if (linksAdded >= MAX_AUTO_LINKS || linkedThisTarget) return match;
        linkedThisTarget = true;
        linksAdded += 1;
        return `${prefix}[${entity}](${target.path})`;
      },
    );
  }

  return restoreMarkdownSegments(nextText, protectedDoc.tokens);
}

function normalizeLinkPath(url: string): string | null {
  const trimmed = String(url || "").trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname !== "farreachco.com" && parsed.hostname !== "www.farreachco.com") {
        return null;
      }
      return parsed.pathname.replace(/\/+$/, "") || "/";
    } catch {
      return null;
    }
  }

  if (!trimmed.startsWith("/")) return null;
  const basePath = trimmed.split(/[?#]/)[0];
  return basePath.replace(/\/+$/, "") || "/";
}

function stripInvalidLinks(markdown: string): string {
  const paths = getValidPaths();
  // Match markdown links: [text](url)
  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const normalizedPath = normalizeLinkPath(url);
    if (normalizedPath && paths.has(normalizedPath)) return match;
    // Not a valid page — keep the text, drop the link
    return text;
  });
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function searchSrd(
  query: string,
  short = false,
  contextHint?: SearchContextHint,
): Promise<string> {
  const normalizedContext = normalizeSearchContextHint(contextHint);

  // Check cache
  const cached = await getCached(query, short, normalizedContext);
  if (cached) return cached;

  // Detect relevant categories
  const categories = detectCategories(query);

  // Find and serialize relevant entries
  const context = findRelevantEntries(query, categories, {
    context: normalizedContext || undefined,
  });

  if (!context) {
    return "I couldn't find any relevant SRD data for that query. Try asking about specific spells, monsters, equipment, conditions, or other D&D 5E rules.";
  }

  const pageContext = buildPageContextBlock(normalizedContext);

  // Query Mistral; short mode skips auto-linking (plain text for Discord).
  const raw = await queryMistral(query, context, short, pageContext);
  const answer = short ? raw : stripInvalidLinks(addDeterministicLinks(raw));

  // Cache the result
  await setCache(query, answer, short, normalizedContext);

  return answer;
}
