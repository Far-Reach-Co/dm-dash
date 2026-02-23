import { srdData } from "./data.js";
import { SERIALIZERS, serializeGeneric } from "./serializers.js";

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
): number {
  const { name, desc } = getEntryText(entry);
  const nameLower = name.toLowerCase();
  const descLower = desc.toLowerCase();
  const normalizedName = normalizeForMatch(name);
  const normalizedIndex = normalizeForMatch(String(entry.index || ""));
  const entryKey = getEntryKey(category, entry);
  let score = 0;

  if (boostedEntryKeys.has(entryKey)) score += 140;
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

export function findRelevantEntries(query: string, categories: string[]): string {
  const queryTokens = tokenize(query);
  const normalizedQuery = normalizeForMatch(query);
  const { hintedCategories, boostedEntryKeys } = findTitleHints(query, queryTokens);
  const searchCategories = new Set<string>(categories || []);
  for (const category of hintedCategories) searchCategories.add(category);
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
