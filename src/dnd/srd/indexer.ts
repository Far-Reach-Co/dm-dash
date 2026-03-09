import { srdData } from "./data.js";
import { SERIALIZERS, serializeGeneric } from "./serializers.js";
import { normalizeSearchContextHint, type SearchContextHint } from "./context.js";

// ── Entry text extraction ─────────────────────────────────────────────────────

function pushRefNames(parts: string[], arr: any[] | undefined) {
  if (Array.isArray(arr) && arr.length) {
    parts.push(arr.map((r: any) => r.name || r.index || r).join(" "));
  }
}

function pushAbilityBlock(parts: string[], list: any[] | undefined, label?: string) {
  if (!Array.isArray(list) || !list.length) return;
  if (label) parts.push(label);
  for (const a of list) {
    if (a.name) parts.push(a.name);
    if (Array.isArray(a.desc)) parts.push(a.desc.join(" "));
    else if (typeof a.desc === "string") parts.push(a.desc);
  }
}

function getEntryText(entry: any): { name: string; desc: string } {
  const name = entry.name || entry.index || "";
  const p: string[] = [];

  // ── Universal fields ──
  if (Array.isArray(entry.desc)) p.push(entry.desc.join(" "));
  else if (typeof entry.desc === "string") p.push(entry.desc);
  if (entry.full_name) p.push(entry.full_name);
  if (entry.type) p.push(entry.type);
  if (entry.alignment) p.push(entry.alignment);

  // ── Spells ──
  if (entry.school?.name) p.push(entry.school.name);
  if (entry.damage?.damage_type?.name) p.push(entry.damage.damage_type.name);
  if (entry.material) p.push(entry.material);
  if (entry.range) p.push(entry.range);
  if (entry.duration) p.push(entry.duration);
  if (entry.casting_time) p.push(entry.casting_time);
  if (entry.attack_type) p.push(entry.attack_type);
  if (Array.isArray(entry.components)) p.push(entry.components.join(" "));
  if (Array.isArray(entry.higher_level)) p.push(entry.higher_level.join(" "));
  if (entry.concentration) p.push("concentration");
  if (entry.ritual) p.push("ritual");
  pushRefNames(p, entry.classes);
  pushRefNames(p, entry.subclasses);

  // ── Monsters ──
  if (entry.size) p.push(entry.size);
  if (entry.hit_dice) p.push(entry.hit_dice);
  if (entry.languages && typeof entry.languages === "string") p.push(entry.languages);
  if (entry.challenge_rating !== undefined) p.push(`cr ${entry.challenge_rating}`);
  // Speed
  if (entry.speed && typeof entry.speed === "object") {
    p.push(Object.entries(entry.speed).map(([m, v]) => `${m} ${v}`).join(" "));
  }
  // Senses
  if (entry.senses && typeof entry.senses === "object") {
    p.push(Object.entries(entry.senses).map(([k, v]) => `${k.replace(/_/g, " ")} ${v}`).join(" "));
  }
  // Proficiencies (monster saving throws & skills)
  if (Array.isArray(entry.proficiencies)) {
    for (const prof of entry.proficiencies) {
      if (prof.proficiency?.name) p.push(prof.proficiency.name);
    }
  }
  // Immunities, resistances, vulnerabilities
  if (Array.isArray(entry.damage_immunities) && entry.damage_immunities.length) {
    p.push("damage immunities " + entry.damage_immunities.join(" "));
  }
  if (Array.isArray(entry.damage_resistances) && entry.damage_resistances.length) {
    p.push("damage resistances " + entry.damage_resistances.join(" "));
  }
  if (Array.isArray(entry.damage_vulnerabilities) && entry.damage_vulnerabilities.length) {
    p.push("damage vulnerabilities " + entry.damage_vulnerabilities.join(" "));
  }
  pushRefNames(p, entry.condition_immunities);
  // Actions, special abilities, legendary actions
  pushAbilityBlock(p, entry.special_abilities);
  pushAbilityBlock(p, entry.actions);
  pushAbilityBlock(p, entry.legendary_actions, "legendary actions");

  // ── Classes ──
  if (entry.hit_die) p.push(`hit die d${entry.hit_die}`);
  pushRefNames(p, entry.saving_throws);
  pushRefNames(p, entry.subclasses);
  if (entry.class?.name) p.push(entry.class.name);
  if (entry.subclass_flavor) p.push(entry.subclass_flavor);

  // ── Races / Subraces ──
  if (entry.speed && typeof entry.speed === "number") p.push(`speed ${entry.speed}`);
  if (Array.isArray(entry.ability_bonuses)) {
    for (const b of entry.ability_bonuses) {
      if (b.ability_score?.name) p.push(b.ability_score.name);
    }
  }
  if (entry.age) p.push(entry.age);
  if (entry.size_description) p.push(entry.size_description);
  if (entry.language_desc) p.push(entry.language_desc);
  pushRefNames(p, entry.traits);
  pushRefNames(p, entry.subraces);
  pushRefNames(p, entry.racial_traits);
  if (entry.race?.name) p.push(entry.race.name);
  // Languages as refs (races)
  if (Array.isArray(entry.languages)) {
    pushRefNames(p, entry.languages);
  }

  // ── Equipment ──
  if (entry.equipment_category?.name) p.push(entry.equipment_category.name);
  if (entry.weapon_category) p.push(entry.weapon_category);
  if (entry.weapon_range) p.push(entry.weapon_range);
  if (entry.category_range) p.push(entry.category_range);
  if (entry.cost) p.push(`${entry.cost.quantity} ${entry.cost.unit}`);
  pushRefNames(p, entry.properties);
  if (entry.rarity?.name) p.push(entry.rarity.name);
  if (Array.isArray(entry.contents)) {
    for (const c of entry.contents) {
      if (c.item?.name) p.push(c.item.name);
    }
  }

  // ── Skills ──
  if (entry.ability_score?.name) p.push(entry.ability_score.name);

  // ── Backgrounds ──
  if (entry.feature?.name) p.push(entry.feature.name);
  pushRefNames(p, entry.starting_proficiencies);

  // ── Features / Feats ──
  if (entry.level !== undefined) p.push(`level ${entry.level}`);
  if (Array.isArray(entry.prerequisites)) {
    for (const pre of entry.prerequisites) {
      if (pre.ability_score?.name) p.push(pre.ability_score.name);
    }
  }

  // ── Levels ──
  if (entry.prof_bonus) p.push(`proficiency bonus +${entry.prof_bonus}`);
  pushRefNames(p, entry.features);

  // ── Proficiencies ──
  pushRefNames(p, entry.races);
  if (entry.reference?.name) p.push(entry.reference.name);

  // ── Traits ──
  pushRefNames(p, entry.races);
  pushRefNames(p, entry.subraces);

  // ── Rules ──
  if (Array.isArray(entry.subsections)) {
    p.push(entry.subsections.map((s: any) => s.name).join(" "));
  }

  // ── Languages (type & speakers) ──
  if (entry.typical_speakers) {
    pushRefNames(p, entry.typical_speakers);
  }
  if (entry.script) p.push(entry.script);

  return { name, desc: p.join(" ") };
}

// ── Scoring & search ──────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function isTitleLikeQuery(query: string, queryTokens: string[]): boolean {
  const lower = query.toLowerCase().trim();
  if (!lower) return false;
  if (queryTokens.length <= 3) return true;
  if (queryTokens.length > 6 || lower.length > 80) return false;
  if (/^(what|which|how|when|where|why|who|can|does|do|is|are|list|show|tell|find)\b/.test(lower)) {
    return false;
  }
  return true;
}

function getEntryKey(category: string, entry: any): string {
  const index = normalizeForMatch(String(entry.index || ""));
  if (index) return `${category}:${index}`;
  const fallbackName = normalizeForMatch(String(entry.name || ""));
  return `${category}:${fallbackName}`;
}

function resolveContextHint(context?: SearchContextHint): {
  category: string | null;
  entryKey: string | null;
  index: string | null;
} {
  const normalizedContext = normalizeSearchContextHint(context);
  if (!normalizedContext) return { category: null, entryKey: null, index: null };

  const category = normalizedContext.category;
  const rawIndex = String(normalizedContext.index || "");
  const normalizedIndex = normalizeForMatch(rawIndex);
  const entryKey = category && normalizedIndex ? `${category}:${normalizedIndex}` : null;

  return { category, entryKey, index: normalizedIndex || null };
}

type QueryIntent = {
  wantsFeatures: boolean;
  wantsSpells: boolean;
  wantsMonsterDetails: boolean;
  asksSpellUsers: boolean;
};

const GENERIC_SCOPE_TOKENS = new Set<string>([
  "who",
  "what",
  "which",
  "where",
  "when",
  "why",
  "how",
  "can",
  "could",
  "should",
  "would",
  "this",
  "that",
  "these",
  "those",
  "use",
  "using",
  "get",
  "gets",
  "learn",
  "learns",
  "any",
  "all",
  "list",
  "show",
  "core",
  "class",
  "classes",
  "feature",
  "features",
  "spell",
  "spells",
  "cantrip",
  "cantrips",
  "monster",
  "monsters",
  "creature",
  "creatures",
  "action",
  "actions",
  "attack",
  "attacks",
  "ability",
  "abilities",
  "stat",
  "stats",
  "ac",
  "hp",
  "speed",
  "resistance",
  "resistances",
  "immunity",
  "immunities",
  "legendary",
  "senses",
  "equipment",
  "item",
  "items",
  "race",
  "races",
  "background",
  "backgrounds",
  "feat",
  "feats",
  "condition",
  "conditions",
  "skill",
  "skills",
  "level",
  "levels",
  "subclass",
  "subclasses",
]);

function isLikelyExplicitEntityQuery(queryTokens: string[]): boolean {
  for (const token of queryTokens) {
    if (token.length < 3) continue;
    if (!GENERIC_SCOPE_TOKENS.has(token)) return true;
  }
  return false;
}

function detectQueryIntent(queryTokens: string[], normalizedQuery: string): QueryIntent {
  const tokenSet = new Set(queryTokens);
  const hasToken = (value: string) => tokenSet.has(value);
  const hasPhrase = (value: string) => normalizedQuery.includes(value);

  const wantsFeatures =
    hasToken("feature") ||
    hasToken("features") ||
    hasToken("ability") ||
    hasToken("abilities") ||
    hasPhrase("core feature") ||
    hasPhrase("core features") ||
    hasPhrase("class feature") ||
    hasPhrase("class features");
  const wantsSpells =
    hasToken("spell") ||
    hasToken("spells") ||
    hasToken("cantrip") ||
    hasToken("cantrips") ||
    hasToken("cast") ||
    hasToken("casting") ||
    hasPhrase("spell list");
  const wantsMonsterDetails =
    hasToken("action") ||
    hasToken("actions") ||
    hasToken("attack") ||
    hasToken("attacks") ||
    hasToken("legendary") ||
    hasToken("resistance") ||
    hasToken("resistances") ||
    hasToken("immunity") ||
    hasToken("immunities") ||
    hasToken("senses") ||
    hasToken("speed") ||
    hasToken("ac") ||
    hasToken("hp") ||
    hasPhrase("armor class") ||
    hasPhrase("hit points") ||
    hasPhrase("challenge rating");
  const asksSpellUsers =
    hasPhrase("who can use") ||
    hasPhrase("who can cast") ||
    hasPhrase("who gets") ||
    hasPhrase("which class") ||
    hasPhrase("which classes") ||
    hasPhrase("what class") ||
    hasPhrase("what classes") ||
    hasPhrase("which race") ||
    hasPhrase("which races") ||
    hasPhrase("what race") ||
    hasPhrase("what races");

  return {
    wantsFeatures,
    wantsSpells,
    wantsMonsterDetails,
    asksSpellUsers,
  };
}

type TitleIndexRecord = {
  category: string;
  entry: any;
  key: string;
  normalizedName: string;
  normalizedIndex: string;
};

let titleIndexRecords: TitleIndexRecord[] | null = null;
let exactTitleMap: Map<string, TitleIndexRecord[]> | null = null;
let exactIndexMap: Map<string, TitleIndexRecord[]> | null = null;

function getAllSrdCategories(): string[] {
  return Object.keys(srdData);
}

function ensureTitleIndex() {
  if (titleIndexRecords && exactTitleMap && exactIndexMap) {
    return {
      records: titleIndexRecords,
      titles: exactTitleMap,
      indexes: exactIndexMap,
    };
  }

  const records: TitleIndexRecord[] = [];
  const titles = new Map<string, TitleIndexRecord[]>();
  const indexes = new Map<string, TitleIndexRecord[]>();

  for (const category of getAllSrdCategories()) {
    for (const entry of srdData[category] || []) {
      const rawName = String(entry.name || entry.full_name || entry.index || "");
      const normalizedName = normalizeForMatch(rawName);
      const normalizedIndex = normalizeForMatch(String(entry.index || ""));
      if (!normalizedName && !normalizedIndex) continue;

      const record: TitleIndexRecord = {
        category,
        entry,
        key: getEntryKey(category, entry),
        normalizedName,
        normalizedIndex,
      };
      records.push(record);

      if (normalizedName) {
        const existing = titles.get(normalizedName);
        if (existing) existing.push(record);
        else titles.set(normalizedName, [record]);
      }
      if (normalizedIndex) {
        const existing = indexes.get(normalizedIndex);
        if (existing) existing.push(record);
        else indexes.set(normalizedIndex, [record]);
      }
    }
  }

  titleIndexRecords = records;
  exactTitleMap = titles;
  exactIndexMap = indexes;

  return { records, titles, indexes };
}

function findTitleHints(query: string, queryTokens: string[]) {
  const normalizedQuery = normalizeForMatch(query);
  const hintedCategories = new Set<string>();
  const boostedEntryKeys = new Set<string>();
  if (!normalizedQuery) return { hintedCategories, boostedEntryKeys };

  const { records, titles, indexes } = ensureTitleIndex();
  const addMatch = (record: TitleIndexRecord) => {
    hintedCategories.add(record.category);
    boostedEntryKeys.add(record.key);
  };

  const exactTitle = titles.get(normalizedQuery) || [];
  const exactIndex = indexes.get(normalizedQuery) || [];
  for (const record of exactTitle) addMatch(record);
  for (const record of exactIndex) addMatch(record);

  // No exact hit. Try high-confidence partial title matches.
  if (!boostedEntryKeys.size && normalizedQuery.length >= 4) {
    const partialMatches: { record: TitleIndexRecord; score: number }[] = [];
    for (const record of records) {
      let score = 0;
      if (record.normalizedName.startsWith(normalizedQuery)) score = 95;
      else if (record.normalizedIndex.startsWith(normalizedQuery)) score = 90;
      else if (record.normalizedName.includes(normalizedQuery)) score = 82;
      else if (record.normalizedIndex.includes(normalizedQuery)) score = 80;
      else if (
        normalizedQuery.includes(record.normalizedName) &&
        record.normalizedName.length >= 4
      ) {
        score = 70;
      } else if (queryTokens.length >= 2) {
        let overlap = 0;
        for (const token of queryTokens) {
          if (record.normalizedName.includes(token)) overlap++;
        }
        if (overlap === queryTokens.length) score = 72;
      }

      if (score >= 70) partialMatches.push({ record, score });
    }

    partialMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .forEach(({ record }) => addMatch(record));
  }

  return { hintedCategories, boostedEntryKeys };
}

function scoreEntry(
  queryTokens: string[],
  normalizedQuery: string,
  category: string,
  entry: any,
  boostedEntryKeys: Set<string>,
  contextCategory: string | null,
  contextEntryKey: string | null,
  contextIndex: string | null,
  applyContextBoost: boolean,
  queryIntent: QueryIntent,
): number {
  const { name, desc } = getEntryText(entry);
  const nameLower = name.toLowerCase();
  const descLower = desc.toLowerCase();
  const normalizedName = normalizeForMatch(name);
  const normalizedIndex = normalizeForMatch(String(entry.index || ""));
  const entryKey = getEntryKey(category, entry);
  let score = 0;

  if (boostedEntryKeys.has(entryKey)) score += 140;
  if (applyContextBoost && contextCategory && category === contextCategory) {
    score += 7;
  }
  if (applyContextBoost && contextEntryKey && entryKey === contextEntryKey) {
    score += 55;
  }
  if (
    applyContextBoost &&
    contextCategory === "classes" &&
    contextIndex &&
    category === "classes" &&
    contextEntryKey &&
    entryKey !== contextEntryKey
  ) {
    score -= 12;
  }
  if (applyContextBoost && contextCategory === "classes" && contextIndex) {
    const entryClassIndex = normalizeForMatch(String(entry?.class?.index || ""));
    const preferFeatures = queryIntent.wantsFeatures && !queryIntent.wantsSpells;
    const preferSpells = queryIntent.wantsSpells && !queryIntent.wantsFeatures;

    if (category === "spells") {
      const hasClassTag = Array.isArray(entry?.classes)
        ? entry.classes.some(
            (cls: any) =>
              normalizeForMatch(String(cls?.index || cls?.name || "")) === contextIndex,
          )
        : false;
      if (hasClassTag) {
        if (preferSpells) score += 95;
        else if (preferFeatures) score += 5;
        else score += 45;
      }
      else score -= 18;
      if (preferFeatures) score -= 45;
    } else if (category === "features" || category === "subclasses" || category === "levels") {
      if (entryClassIndex && entryClassIndex === contextIndex) {
        if (category === "features") {
          score += preferFeatures ? 110 : 55;
        } else if (category === "levels") {
          score += preferFeatures ? 85 : 45;
        } else {
          score += preferFeatures ? 90 : 45;
        }
        if (preferSpells) score -= 20;
      }
      else score -= 8;
    }
  }
  if (applyContextBoost && contextCategory === "spells") {
    if (category === "spells" && contextEntryKey && entryKey === contextEntryKey) {
      score += 110;
    } else if (queryIntent.asksSpellUsers) {
      if (category === "spells") score -= 35;
      else score -= 12;
    }
  }
  if (applyContextBoost && contextCategory === "monsters") {
    if (category === "monsters" && contextEntryKey && entryKey === contextEntryKey) {
      score += 120;
    } else if (queryIntent.wantsMonsterDetails && category !== "monsters") {
      score -= 20;
    }
  }
  if (normalizedQuery) {
    if (normalizedName === normalizedQuery) score += 120;
    if (normalizedIndex && normalizedIndex === normalizedQuery) score += 110;
    if (normalizedName.startsWith(normalizedQuery) && normalizedQuery.length >= 3) {
      score += 70;
    } else if (normalizedName.includes(normalizedQuery) && normalizedQuery.length >= 4) {
      score += 45;
    }
  }

  let nameTokenHits = 0;
  for (const token of queryTokens) {
    if (nameLower.includes(token)) {
      score += 8;
      nameTokenHits++;
    }
    if (descLower.includes(token)) score += 1;
  }
  if (nameTokenHits === queryTokens.length && queryTokens.length > 1) score += 20;

  return score;
}

// ~4 chars per token on average, budget ~8K tokens = ~32K chars
const MAX_CONTEXT_CHARS = 32000;

export function findRelevantEntries(
  query: string,
  categories: string[],
  opts?: { context?: SearchContextHint },
): string {
  const queryTokens = tokenize(query);
  const normalizedQuery = normalizeForMatch(query);
  const queryIntent = detectQueryIntent(queryTokens, normalizedQuery);
  const hasLikelyExplicitEntity = isLikelyExplicitEntityQuery(queryTokens);
  const { hintedCategories, boostedEntryKeys } = hasLikelyExplicitEntity
    ? findTitleHints(query, queryTokens)
    : { hintedCategories: new Set<string>(), boostedEntryKeys: new Set<string>() };
  const contextHint = resolveContextHint(opts?.context);
  const hasCompetingExplicitEntity =
    hasLikelyExplicitEntity &&
    boostedEntryKeys.size > 0 &&
    (!contextHint.entryKey ||
      Array.from(boostedEntryKeys).some((entryKey) => entryKey !== contextHint.entryKey));
  const applyContextBoost = Boolean((contextHint.category || contextHint.entryKey) && !hasCompetingExplicitEntity);

  const searchCategories = new Set<string>(categories || []);
  for (const category of hintedCategories) searchCategories.add(category);
  if (applyContextBoost && contextHint.category) searchCategories.add(contextHint.category);
  if (isTitleLikeQuery(query, queryTokens) || searchCategories.size === 0) {
    for (const category of getAllSrdCategories()) searchCategories.add(category);
  }

  const scored: { text: string; score: number }[] = [];

  for (const cat of searchCategories) {
    const entries = srdData[cat] || [];
    const serialize = SERIALIZERS[cat] || ((e: any) => serializeGeneric(e, cat.toUpperCase()));

    for (const entry of entries) {
      const score = scoreEntry(
        queryTokens,
        normalizedQuery,
        cat,
        entry,
        boostedEntryKeys,
        contextHint.category,
        contextHint.entryKey,
        contextHint.index,
        applyContextBoost,
        queryIntent,
      );
      if (score > 0) {
        scored.push({ text: serialize(entry), score });
      }
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Pack entries within token budget
  let totalChars = 0;
  const selected: string[] = [];
  for (const item of scored) {
    if (totalChars + item.text.length > MAX_CONTEXT_CHARS) break;
    selected.push(item.text);
    totalChars += item.text.length;
  }

  return selected.join("\n\n---\n\n");
}
