import { srdData } from "./srd/data.js";

const CLASS_TABLE_PARTIALS = new Set([
  "barbarian",
  "bard",
  "cleric",
  "druid",
  "fighter",
  "monk",
  "paladin",
  "ranger",
  "rogue",
  "sorcerer",
  "warlock",
  "wizard",
]);

export const DND_API_BASE = "https://www.dnd5eapi.co";

let equipmentDataCache: any[] | null = null;
let magicItemsDataCache: any[] | null = null;
let spellsDataCache: any[] | null = null;
let monstersDataCache: any[] | null = null;
let classesDataCache: any[] | null = null;
let featuresDataCache: any[] | null = null;
let racesDataCache: any[] | null = null;
let backgroundsDataCache: any[] | null = null;
let traitsDataCache: any[] | null = null;
let subracesDataCache: any[] | null = null;

let equipmentMapCache: Map<string, any> | null = null;
let magicItemsMapCache: Map<string, any> | null = null;
let spellsMapCache: Map<string, any> | null = null;
let monstersMapCache: Map<string, any> | null = null;
let classesMapCache: Map<string, any> | null = null;
let featuresMapCache: Map<string, any> | null = null;
let racesMapCache: Map<string, any> | null = null;
let backgroundsMapCache: Map<string, any> | null = null;
let traitsMapCache: Map<string, any> | null = null;
let subracesMapCache: Map<string, any> | null = null;

export function getEquipmentData(): any[] {
  if (!equipmentDataCache) equipmentDataCache = srdData["equipment"] || [];
  return equipmentDataCache;
}

export function getMagicItemsData(): any[] {
  if (!magicItemsDataCache) magicItemsDataCache = srdData["magic-items"] || [];
  return magicItemsDataCache;
}

export function getSpellsData(): any[] {
  if (!spellsDataCache) spellsDataCache = srdData["spells"] || [];
  return spellsDataCache;
}

export function getMonstersData(): any[] {
  if (!monstersDataCache) monstersDataCache = srdData["monsters"] || [];
  return monstersDataCache;
}

export function getClassesData(): any[] {
  if (!classesDataCache) classesDataCache = srdData["classes"] || [];
  return classesDataCache;
}

export function getFeaturesData(): any[] {
  if (!featuresDataCache) featuresDataCache = srdData["features"] || [];
  return featuresDataCache;
}

export function getRacesData(): any[] {
  if (!racesDataCache) racesDataCache = srdData["races"] || [];
  return racesDataCache;
}

export function getBackgroundsData(): any[] {
  if (!backgroundsDataCache) backgroundsDataCache = srdData["backgrounds"] || [];
  return backgroundsDataCache;
}

export function getTraitsData(): any[] {
  if (!traitsDataCache) traitsDataCache = srdData["traits"] || [];
  return traitsDataCache;
}

export function getSubracesData(): any[] {
  if (!subracesDataCache) subracesDataCache = srdData["subraces"] || [];
  return subracesDataCache;
}

export function getEquipmentMap(): Map<string, any> {
  if (!equipmentMapCache) {
    equipmentMapCache = new Map(
      getEquipmentData().map((entry: any) => [entry.index, entry]),
    );
  }
  return equipmentMapCache;
}

export function getMagicItemsMap(): Map<string, any> {
  if (!magicItemsMapCache) {
    magicItemsMapCache = new Map(
      getMagicItemsData().map((entry: any) => [entry.index, entry]),
    );
  }
  return magicItemsMapCache;
}

export function getSpellsMap(): Map<string, any> {
  if (!spellsMapCache) {
    spellsMapCache = new Map(
      getSpellsData().map((entry: any) => [entry.index, entry]),
    );
  }
  return spellsMapCache;
}

export function getMonstersMap(): Map<string, any> {
  if (!monstersMapCache) {
    monstersMapCache = new Map(
      getMonstersData().map((entry: any) => [entry.index, entry]),
    );
  }
  return monstersMapCache;
}

export function getClassesMap(): Map<string, any> {
  if (!classesMapCache) {
    classesMapCache = new Map(
      getClassesData().map((entry: any) => [entry.index, entry]),
    );
  }
  return classesMapCache;
}

export function getFeaturesMap(): Map<string, any> {
  if (!featuresMapCache) {
    featuresMapCache = new Map(
      getFeaturesData().map((entry: any) => [entry.index, entry]),
    );
  }
  return featuresMapCache;
}

export function getRacesMap(): Map<string, any> {
  if (!racesMapCache) {
    racesMapCache = new Map(
      getRacesData().map((entry: any) => [entry.index, entry]),
    );
  }
  return racesMapCache;
}

export function getBackgroundsMap(): Map<string, any> {
  if (!backgroundsMapCache) {
    backgroundsMapCache = new Map(
      getBackgroundsData().map((entry: any) => [entry.index, entry]),
    );
  }
  return backgroundsMapCache;
}

export function getTraitsMap(): Map<string, any> {
  if (!traitsMapCache) {
    traitsMapCache = new Map(
      getTraitsData().map((entry: any) => [entry.index, entry]),
    );
  }
  return traitsMapCache;
}

export function getSubracesMap(): Map<string, any> {
  if (!subracesMapCache) {
    subracesMapCache = new Map(
      getSubracesData().map((entry: any) => [entry.index, entry]),
    );
  }
  return subracesMapCache;
}

export function toMonsterTypeSlug(typeName: string): string {
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

function formatCrLabel(crValue: string): string {
  if (crValue === "0.125") return "1/8";
  if (crValue === "0.25") return "1/4";
  if (crValue === "0.5") return "1/2";
  return crValue;
}

export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.name.localeCompare(b.name));
}

export function getSpellSchoolOptions(): Array<{ index: string; label: string; count: number }> {
  const counts = new Map<string, { label: string; count: number }>();
  for (const spell of getSpellsData()) {
    if (!spell?.school?.index || !spell?.school?.name) continue;
    const key = spell.school.index;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { label: spell.school.name, count: 1 });
    }
  }

  return Array.from(counts.entries())
    .map(([index, value]) => ({ index, label: value.label, count: value.count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getSpellClassOptions(): Array<{ index: string; label: string; count: number }> {
  const counts = new Map<string, { label: string; count: number }>();
  for (const spell of getSpellsData()) {
    for (const cls of spell.classes || []) {
      if (!cls?.index || !cls?.name) continue;
      const existing = counts.get(cls.index);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(cls.index, { label: cls.name, count: 1 });
      }
    }
  }

  return Array.from(counts.entries())
    .map(([index, value]) => ({ index, label: value.label, count: value.count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getSpellLevelOptions(): Array<{ value: number; label: string; count: number }> {
  const counts = new Map<number, number>();
  for (const spell of getSpellsData()) {
    const level = Number(spell.level);
    if (Number.isNaN(level)) continue;
    counts.set(level, (counts.get(level) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      count,
      label: value === 0 ? "Cantrips" : `Level ${value}`,
    }))
    .sort((a, b) => a.value - b.value);
}

export function getMonsterTypeOptions(): Array<{
  type: string;
  slug: string;
  label: string;
  count: number;
}> {
  const counts = new Map<string, number>();
  for (const monster of getMonstersData()) {
    const type = String(monster?.type || "").trim().toLowerCase();
    if (!type) continue;
    counts.set(type, (counts.get(type) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([type, count]) => ({
      type,
      slug: toMonsterTypeSlug(type),
      label: type
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getMonsterCrOptions(): Array<{
  value: string;
  slug: string;
  label: string;
  count: number;
}> {
  const counts = new Map<string, number>();
  for (const monster of getMonstersData()) {
    const cr = String(monster?.challenge_rating ?? "");
    if (!cr) continue;
    counts.set(cr, (counts.get(cr) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      slug: toCrSlug(value),
      label: formatCrLabel(value),
      count,
      numeric: Number(value),
    }))
    .sort((a, b) => a.numeric - b.numeric)
    .map(({ numeric, ...entry }) => entry);
}

export function getFeatureClassOptions(): Array<{ index: string; label: string; count: number }> {
  const counts = new Map<string, { label: string; count: number }>();
  for (const feature of getFeaturesData()) {
    const cls = feature?.class;
    if (!cls?.index || !cls?.name) continue;
    const existing = counts.get(cls.index);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(cls.index, { label: cls.name, count: 1 });
    }
  }

  return Array.from(counts.entries())
    .map(([index, value]) => ({ index, label: value.label, count: value.count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function toClassTablePartial(classIndex: string): string | null {
  if (!CLASS_TABLE_PARTIALS.has(classIndex)) return null;
  return `partials/tables/${classIndex}`;
}
