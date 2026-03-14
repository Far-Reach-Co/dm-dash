import path = require("path");
import fs = require("fs");
import { srdData } from "./srd/data.js";
import {
  type ClassRelationshipsData,
  type DamageTypeRelationshipsData,
  type EquipmentFacetsData,
  type MonsterFacetsData,
  type RaceRelationshipsData,
  type SpellFacetsData,
  CLASS_RELATIONSHIPS_FILE,
  DAMAGE_TYPE_RELATIONSHIPS_FILE,
  EQUIPMENT_FACETS_FILE,
  MONSTER_FACETS_FILE,
  RACE_RELATIONSHIPS_FILE,
  SPELL_FACETS_FILE,
} from "./srd/derivedDatasets.js";
import {
  type SpellClassLevelIndexData,
  SPELL_CLASS_LEVEL_INDEX_FILE,
  normalizeClassIndex,
} from "./srd/spellClassLevelIndex.js";

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
const DATA_DIR = path.join(__dirname, "../../public/lib/data/2014");

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
let spellClassLevelIndexCache: SpellClassLevelIndexData | null = null;
let damageTypeRelationshipsCache: DamageTypeRelationshipsData | null = null;
let spellFacetsCache: SpellFacetsData | null = null;
let classRelationshipsCache: ClassRelationshipsData | null = null;
let monsterFacetsCache: MonsterFacetsData | null = null;
let equipmentFacetsCache: EquipmentFacetsData | null = null;
let raceRelationshipsCache: RaceRelationshipsData | null = null;

function loadSpellClassLevelIndexFile(): SpellClassLevelIndexData {
  const filePath = path.join(DATA_DIR, SPELL_CLASS_LEVEL_INDEX_FILE);
  let raw = "";
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    throw new Error(
      `Missing ${SPELL_CLASS_LEVEL_INDEX_FILE} at ${filePath}. Run npm run srd:spell-class-index -- 2014.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in ${SPELL_CLASS_LEVEL_INDEX_FILE}: ${filePath}`);
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    !("classes" in parsed) ||
    typeof (parsed as any).classes !== "object" ||
    Array.isArray((parsed as any).classes)
  ) {
    throw new Error(`Invalid spell class/level index shape in ${SPELL_CLASS_LEVEL_INDEX_FILE}`);
  }

  return parsed as SpellClassLevelIndexData;
}

export function getSpellClassLevelIndex(): SpellClassLevelIndexData {
  if (spellClassLevelIndexCache) return spellClassLevelIndexCache;

  spellClassLevelIndexCache = loadSpellClassLevelIndexFile();
  return spellClassLevelIndexCache;
}

function loadDamageTypeRelationshipsFile(): DamageTypeRelationshipsData {
  const filePath = path.join(DATA_DIR, DAMAGE_TYPE_RELATIONSHIPS_FILE);
  let raw = "";
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    throw new Error(
      `Missing ${DAMAGE_TYPE_RELATIONSHIPS_FILE} at ${filePath}. Run npm run srd:derived-datasets -- 2014.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in ${DAMAGE_TYPE_RELATIONSHIPS_FILE}: ${filePath}`);
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    !("damageTypes" in parsed) ||
    typeof (parsed as any).damageTypes !== "object" ||
    Array.isArray((parsed as any).damageTypes)
  ) {
    throw new Error(
      `Invalid damage type relationships shape in ${DAMAGE_TYPE_RELATIONSHIPS_FILE}`,
    );
  }

  return parsed as DamageTypeRelationshipsData;
}

export function getDamageTypeRelationships(): DamageTypeRelationshipsData {
  if (damageTypeRelationshipsCache) return damageTypeRelationshipsCache;

  damageTypeRelationshipsCache = loadDamageTypeRelationshipsFile();
  return damageTypeRelationshipsCache;
}

export function getDamageTypeRelationship(index: string) {
  const normalized = String(index || "").trim().toLowerCase();
  if (!normalized) return null;
  return getDamageTypeRelationships().damageTypes[normalized] || null;
}

function loadSpellFacetsFile(): SpellFacetsData {
  const filePath = path.join(DATA_DIR, SPELL_FACETS_FILE);
  let raw = "";
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    throw new Error(
      `Missing ${SPELL_FACETS_FILE} at ${filePath}. Run npm run srd:derived-datasets -- 2014.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in ${SPELL_FACETS_FILE}: ${filePath}`);
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    !("damageTypes" in parsed) ||
    typeof (parsed as any).damageTypes !== "object"
  ) {
    throw new Error(`Invalid spell facets shape in ${SPELL_FACETS_FILE}`);
  }

  return parsed as SpellFacetsData;
}

export function getSpellFacets(): SpellFacetsData {
  if (spellFacetsCache) return spellFacetsCache;

  spellFacetsCache = loadSpellFacetsFile();
  return spellFacetsCache;
}

function loadClassRelationshipsFile(): ClassRelationshipsData {
  const filePath = path.join(DATA_DIR, CLASS_RELATIONSHIPS_FILE);
  let raw = "";
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    throw new Error(
      `Missing ${CLASS_RELATIONSHIPS_FILE} at ${filePath}. Run npm run srd:derived-datasets -- 2014.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in ${CLASS_RELATIONSHIPS_FILE}: ${filePath}`);
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    !("classes" in parsed) ||
    typeof (parsed as any).classes !== "object"
  ) {
    throw new Error(`Invalid class relationships shape in ${CLASS_RELATIONSHIPS_FILE}`);
  }

  return parsed as ClassRelationshipsData;
}

export function getClassRelationships(): ClassRelationshipsData {
  if (classRelationshipsCache) return classRelationshipsCache;

  classRelationshipsCache = loadClassRelationshipsFile();
  return classRelationshipsCache;
}

function loadMonsterFacetsFile(): MonsterFacetsData {
  const filePath = path.join(DATA_DIR, MONSTER_FACETS_FILE);
  let raw = "";
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    throw new Error(
      `Missing ${MONSTER_FACETS_FILE} at ${filePath}. Run npm run srd:derived-datasets -- 2014.`,
    );
  }

  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !parsed.types) {
    throw new Error(`Invalid monster facets shape in ${MONSTER_FACETS_FILE}`);
  }
  return parsed as MonsterFacetsData;
}

export function getMonsterFacets(): MonsterFacetsData {
  if (monsterFacetsCache) return monsterFacetsCache;

  monsterFacetsCache = loadMonsterFacetsFile();
  return monsterFacetsCache;
}

function loadEquipmentFacetsFile(): EquipmentFacetsData {
  const filePath = path.join(DATA_DIR, EQUIPMENT_FACETS_FILE);
  let raw = "";
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    throw new Error(
      `Missing ${EQUIPMENT_FACETS_FILE} at ${filePath}. Run npm run srd:derived-datasets -- 2014.`,
    );
  }

  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !parsed.categories) {
    throw new Error(`Invalid equipment facets shape in ${EQUIPMENT_FACETS_FILE}`);
  }
  return parsed as EquipmentFacetsData;
}

export function getEquipmentFacets(): EquipmentFacetsData {
  if (equipmentFacetsCache) return equipmentFacetsCache;

  equipmentFacetsCache = loadEquipmentFacetsFile();
  return equipmentFacetsCache;
}

function loadRaceRelationshipsFile(): RaceRelationshipsData {
  const filePath = path.join(DATA_DIR, RACE_RELATIONSHIPS_FILE);
  let raw = "";
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    throw new Error(
      `Missing ${RACE_RELATIONSHIPS_FILE} at ${filePath}. Run npm run srd:derived-datasets -- 2014.`,
    );
  }

  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !parsed.traits) {
    throw new Error(`Invalid race relationships shape in ${RACE_RELATIONSHIPS_FILE}`);
  }
  return parsed as RaceRelationshipsData;
}

export function getRaceRelationships(): RaceRelationshipsData {
  if (raceRelationshipsCache) return raceRelationshipsCache;

  raceRelationshipsCache = loadRaceRelationshipsFile();
  return raceRelationshipsCache;
}

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

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

export function getSpellDamageTypeOptions(): Array<{
  index: string;
  label: string;
  count: number;
}> {
  return Object.values(getSpellFacets().damageTypes)
    .map((entry) => ({
      index: entry.index,
      label: entry.label,
      count: entry.spellIndexes.length,
    }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function getSpellClassOptions(): Array<{ index: string; label: string; count: number }> {
  return Object.values(getSpellClassLevelIndex().classes)
    .map((entry) => ({
      index: entry.index,
      label: entry.label,
      count: entry.spellIndexes.length,
    }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getSpellCountForClass(classIndex: string): number {
  const normalized = normalizeClassIndex(classIndex);
  if (!normalized) return 0;
  const entry = getSpellClassLevelIndex().classes[normalized];
  return entry ? entry.spellIndexes.length : 0;
}

export function getSpellLevelsForClass(classIndex: string): number[] {
  const normalized = normalizeClassIndex(classIndex);
  if (!normalized) return [];
  const entry = getSpellClassLevelIndex().classes[normalized];
  return entry ? entry.levels.slice() : [];
}

export function getSpellsForClass(classIndex: string): any[] {
  const normalized = normalizeClassIndex(classIndex);
  if (!normalized) return [];
  const entry = getSpellClassLevelIndex().classes[normalized];
  if (!entry || !entry.spellIndexes.length) return [];

  const spellsMap = getSpellsMap();
  const spells: any[] = [];
  for (const spellIndex of entry.spellIndexes) {
    const spell = spellsMap.get(spellIndex);
    if (spell) spells.push(spell);
  }
  return spells;
}

export function getSpellsForClassAndLevel(classIndex: string, level: number): any[] {
  const normalized = normalizeClassIndex(classIndex);
  if (!normalized) return [];
  const entry = getSpellClassLevelIndex().classes[normalized];
  if (!entry) return [];

  const spellIndexes = entry.spellIndexesByLevel[String(level)] || [];
  if (!spellIndexes.length) return [];

  const spellsMap = getSpellsMap();
  const spells: any[] = [];
  for (const spellIndex of spellIndexes) {
    const spell = spellsMap.get(spellIndex);
    if (spell) spells.push(spell);
  }
  return spells;
}

export function getSpellsForDamageType(damageTypeIndex: string): any[] {
  const normalized = String(damageTypeIndex || "").trim().toLowerCase();
  if (!normalized) return [];
  const entry = getSpellFacets().damageTypes[normalized];
  if (!entry || !entry.spellIndexes.length) return [];

  const spellsMap = getSpellsMap();
  const spells: any[] = [];
  for (const spellIndex of entry.spellIndexes) {
    const spell = spellsMap.get(spellIndex);
    if (spell) spells.push(spell);
  }
  return spells;
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

export function getSpellDamageTypeOptionsForClass(classIndex: string): Array<{
  index: string;
  label: string;
  count: number;
}> {
  const classSpellIndexes = new Set(
    (getSpellClassLevelIndex().classes[normalizeClassIndex(classIndex)]?.spellIndexes || []).slice(),
  );
  if (!classSpellIndexes.size) return [];

  return Object.values(getSpellFacets().damageTypes)
    .map((entry) => {
      let count = 0;
      for (const spellIndex of entry.spellIndexes) {
        if (classSpellIndexes.has(spellIndex)) count += 1;
      }
      return {
        index: entry.index,
        label: entry.label,
        count,
      };
    })
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function getSpellSchoolOptionsForClass(classIndex: string): Array<{
  index: string;
  label: string;
  count: number;
}> {
  const counts = new Map<string, { label: string; count: number }>();
  for (const spell of getSpellsForClass(classIndex)) {
    const schoolIndex = String(spell?.school?.index || "").trim().toLowerCase();
    const schoolName = String(spell?.school?.name || "").trim();
    if (!schoolIndex || !schoolName) continue;
    const existing = counts.get(schoolIndex);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(schoolIndex, { label: schoolName, count: 1 });
    }
  }

  return Array.from(counts.entries())
    .map(([index, value]) => ({
      index,
      label: value.label,
      count: value.count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
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

function getMonsterFacetOptions(
  facets: Record<string, { index: string; label: string; monsterIndexes: string[] }>,
): Array<{ index: string; label: string; count: number }> {
  return Object.values(facets)
    .map((entry) => ({
      index: String(entry?.index || "").trim().toLowerCase(),
      label: String(entry?.label || entry?.index || "").trim(),
      count: Array.isArray(entry?.monsterIndexes) ? entry.monsterIndexes.length : 0,
    }))
    .filter((entry) => entry.index && entry.label && entry.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function getMonstersForFacetMonsterIndexes(monsterIndexes: string[]): any[] {
  if (!Array.isArray(monsterIndexes) || !monsterIndexes.length) return [];
  const monstersMap = getMonstersMap();
  const monsters: any[] = [];
  for (const monsterIndex of monsterIndexes) {
    const monster = monstersMap.get(monsterIndex);
    if (monster) monsters.push(monster);
  }
  return monsters;
}

export function getMonsterConditionImmunityOptions(): Array<{
  index: string;
  label: string;
  count: number;
}> {
  return getMonsterFacetOptions(getMonsterFacets().conditionImmunities);
}

export function getMonstersForConditionImmunity(conditionIndex: string): any[] {
  const normalized = String(conditionIndex || "").trim().toLowerCase();
  if (!normalized) return [];
  const entry = getMonsterFacets().conditionImmunities[normalized];
  if (!entry || !entry.monsterIndexes.length) return [];
  return getMonstersForFacetMonsterIndexes(entry.monsterIndexes);
}

export function getMonsterSenseOptions(): Array<{
  index: string;
  label: string;
  count: number;
}> {
  return getMonsterFacetOptions(getMonsterFacets().senses);
}

export function getMonstersForSense(senseIndex: string): any[] {
  const normalized = String(senseIndex || "").trim().toLowerCase();
  if (!normalized) return [];
  const entry = getMonsterFacets().senses[normalized];
  if (!entry || !entry.monsterIndexes.length) return [];
  return getMonstersForFacetMonsterIndexes(entry.monsterIndexes);
}

export function getMonsterMovementModeOptions(): Array<{
  index: string;
  label: string;
  count: number;
}> {
  return getMonsterFacetOptions(getMonsterFacets().movementModes);
}

export function getMonstersForMovementMode(movementModeIndex: string): any[] {
  const normalized = String(movementModeIndex || "").trim().toLowerCase();
  if (!normalized) return [];
  const entry = getMonsterFacets().movementModes[normalized];
  if (!entry || !entry.monsterIndexes.length) return [];
  return getMonstersForFacetMonsterIndexes(entry.monsterIndexes);
}

export function getMonstersForMonsterType(typeIndex: string): any[] {
  const normalized = String(typeIndex || "").trim().toLowerCase();
  if (!normalized) return [];
  const entry = getMonsterFacets().types[normalized];
  if (!entry || !entry.monsterIndexes.length) return [];
  return getMonstersForFacetMonsterIndexes(entry.monsterIndexes);
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

export function getRelatedDamageTypesForMonster(monster: any): Array<{
  index: string;
  label: string;
}> {
  const damageTypeEntries = (srdData["damage-types"] || [])
    .map((entry: any) => ({
      index: String(entry?.index || "").trim().toLowerCase(),
      label: String(entry?.name || entry?.index || "").trim(),
    }))
    .filter((entry: { index: string; label: string }) => entry.index && entry.label);

  if (!damageTypeEntries.length) return [];

  const indexes = new Set<string>();
  const matchers = damageTypeEntries.map((entry) => ({
    ...entry,
    pattern: new RegExp(`\\b${escapeForRegex(entry.label.toLowerCase())}\\b`, "i"),
  }));

  const groups = [monster?.actions, monster?.legendary_actions, monster?.special_abilities];
  for (const group of groups) {
    for (const item of group || []) {
      for (const damageEntry of item?.damage || []) {
        const damageTypeIndex = String(damageEntry?.damage_type?.index || "")
          .trim()
          .toLowerCase();
        if (damageTypeIndex) indexes.add(damageTypeIndex);
      }
    }
  }

  const textValues = [
    ...(monster?.damage_vulnerabilities || []),
    ...(monster?.damage_resistances || []),
    ...(monster?.damage_immunities || []),
  ];
  for (const value of textValues) {
    const text = String(value || "").trim().toLowerCase();
    if (!text) continue;
    for (const matcher of matchers) {
      if (matcher.pattern.test(text)) indexes.add(matcher.index);
    }
  }

  return Array.from(indexes)
    .map((index) => {
      const match = damageTypeEntries.find((entry) => entry.index === index);
      return {
        index,
        label: match?.label || index,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getClassesForSpellcastingAbility(abilityIndex: string): any[] {
  const normalized = String(abilityIndex || "").trim().toLowerCase();
  if (!normalized) return [];
  const entry = getClassRelationships().spellcastingAbilities[normalized];
  if (!entry || !entry.classIndexes.length) return [];

  const classesMap = getClassesMap();
  const classes: any[] = [];
  for (const classIndex of entry.classIndexes) {
    const classData = classesMap.get(classIndex);
    if (classData) classes.push(classData);
  }
  return classes;
}

export function getSpellRaceAccess(spellIndex: string, spellName: string): {
  races: string[];
  subraces: string[];
} {
  const raceNameByIndex = new Map<string, string>();
  for (const race of getRacesData()) {
    const index = String(race?.index || "").trim().toLowerCase();
    if (!index) continue;
    raceNameByIndex.set(index, String(race?.name || index).trim() || index);
  }

  const subraceLabelByIndex = new Map<string, string>();
  for (const subrace of getSubracesData()) {
    const index = String(subrace?.index || "").trim().toLowerCase();
    if (!index) continue;
    const subraceName = String(subrace?.name || index).trim() || index;
    const raceName =
      String(
        subrace?.race?.name ||
          raceNameByIndex.get(String(subrace?.race?.index || "").toLowerCase()) ||
          "",
      ).trim() || "";
    subraceLabelByIndex.set(index, raceName ? `${subraceName} (${raceName})` : subraceName);
  }

  const normalizedSpellIndex = String(spellIndex || "").trim().toLowerCase();
  const normalizedSpellName = String(spellName || "").trim();
  if (!normalizedSpellIndex || !normalizedSpellName) {
    return { races: [], subraces: [] };
  }

  const races = new Set<string>();
  const subraces = new Set<string>();

  for (const trait of getTraitsData()) {
    if (!traitReferencesSpell(trait, normalizedSpellIndex, normalizedSpellName)) continue;

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

export function toClassTablePartial(classIndex: string): string | null {
  if (!CLASS_TABLE_PARTIALS.has(classIndex)) return null;
  return `partials/tables/${classIndex}`;
}
