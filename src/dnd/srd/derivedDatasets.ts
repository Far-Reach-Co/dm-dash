import {
  buildSpellClassLevelIndex,
  normalizeClassIndex,
} from "./spellClassLevelIndex.js";

export const DAMAGE_TYPE_RELATIONSHIPS_FILE = "5e-srd-damage-type-relationships.json";
export const SPELL_FACETS_FILE = "5e-srd-spell-facets.json";
export const MONSTER_FACETS_FILE = "5e-srd-monster-facets.json";
export const RACE_RELATIONSHIPS_FILE = "5e-srd-race-relationships.json";
export const EQUIPMENT_FACETS_FILE = "5e-srd-equipment-facets.json";
export const CLASS_RELATIONSHIPS_FILE = "5e-srd-class-relationships.json";

type BuilderMeta = {
  source?: string;
  generatedAt?: string;
};

type LabelledIndexEntry = {
  index: string;
  label: string;
};

type SpellClassFacetEntry = LabelledIndexEntry & {
  levels: number[];
  spellIndexes: string[];
  spellIndexesByLevel: Record<string, string[]>;
};

type DamageTypeRelationshipEntry = {
  index: string;
  name: string;
  desc: string[];
  spells: {
    indexes: string[];
    byClass: Record<string, string[]>;
    byLevel: Record<string, string[]>;
  };
  monsters: {
    dealsDamageIndexes: string[];
    resistanceIndexes: string[];
    immunityIndexes: string[];
    vulnerabilityIndexes: string[];
  };
};

export type DamageTypeRelationshipsData = {
  version: number;
  source?: string;
  generatedAt?: string;
  damageTypes: Record<string, DamageTypeRelationshipEntry>;
};

export type SpellFacetsData = {
  version: number;
  source?: string;
  generatedAt?: string;
  levels: Record<string, LabelledIndexEntry & { spellIndexes: string[] }>;
  schools: Record<string, LabelledIndexEntry & { spellIndexes: string[] }>;
  classes: Record<string, SpellClassFacetEntry>;
  damageTypes: Record<string, LabelledIndexEntry & { spellIndexes: string[] }>;
  tags: Record<string, LabelledIndexEntry & { spellIndexes: string[] }>;
  components: Record<string, LabelledIndexEntry & { spellIndexes: string[] }>;
  attackTypes: Record<string, LabelledIndexEntry & { spellIndexes: string[] }>;
  savingThrows: Record<string, LabelledIndexEntry & { spellIndexes: string[] }>;
  areaOfEffectTypes: Record<string, LabelledIndexEntry & { spellIndexes: string[] }>;
};

export type MonsterFacetsData = {
  version: number;
  source?: string;
  generatedAt?: string;
  types: Record<string, LabelledIndexEntry & { monsterIndexes: string[]; rawType: string }>;
  challengeRatings: Record<
    string,
    LabelledIndexEntry & { monsterIndexes: string[]; value: string }
  >;
  sizes: Record<string, LabelledIndexEntry & { monsterIndexes: string[] }>;
  alignments: Record<string, LabelledIndexEntry & { monsterIndexes: string[] }>;
  subtypes: Record<string, LabelledIndexEntry & { monsterIndexes: string[] }>;
  senses: Record<string, LabelledIndexEntry & { monsterIndexes: string[] }>;
  movementModes: Record<string, LabelledIndexEntry & { monsterIndexes: string[] }>;
  conditionImmunities: Record<string, LabelledIndexEntry & { monsterIndexes: string[] }>;
  tags: Record<string, LabelledIndexEntry & { monsterIndexes: string[] }>;
};

export type RaceRelationshipsData = {
  version: number;
  source?: string;
  generatedAt?: string;
  traits: Record<
    string,
    LabelledIndexEntry & {
      raceIndexes: string[];
      subraceIndexes: string[];
    }
  >;
  languages: Record<string, LabelledIndexEntry & { raceIndexes: string[] }>;
  abilityBonuses: Record<
    string,
    LabelledIndexEntry & {
      races: Array<{ index: string; bonus: number }>;
      subraces: Array<{ index: string; bonus: number; raceIndex: string; raceName: string }>;
    }
  >;
  sizes: Record<string, LabelledIndexEntry & { raceIndexes: string[] }>;
};

export type EquipmentFacetsData = {
  version: number;
  source?: string;
  generatedAt?: string;
  categories: Record<string, LabelledIndexEntry & { itemIndexes: string[] }>;
  armorCategories: Record<string, LabelledIndexEntry & { itemIndexes: string[] }>;
  weaponCategories: Record<string, LabelledIndexEntry & { itemIndexes: string[] }>;
  weaponRanges: Record<string, LabelledIndexEntry & { itemIndexes: string[] }>;
  gearCategories: Record<string, LabelledIndexEntry & { itemIndexes: string[] }>;
  toolCategories: Record<string, LabelledIndexEntry & { itemIndexes: string[] }>;
  weaponProperties: Record<string, LabelledIndexEntry & { itemIndexes: string[] }>;
  magicItemRarities: Record<string, LabelledIndexEntry & { itemIndexes: string[] }>;
  proficiencies: Record<string, LabelledIndexEntry & { itemIndexes: string[] }>;
};

export type ClassRelationshipsData = {
  version: number;
  source?: string;
  generatedAt?: string;
  classes: Record<
    string,
    LabelledIndexEntry & {
      spellcastingAbility: LabelledIndexEntry | null;
      savingThrowIndexes: string[];
      proficiencyIndexes: string[];
      startingEquipmentIndexes: string[];
      featureIndexesByLevel: Record<string, string[]>;
      subclassIndexes: string[];
      spellCount: number;
      spellLevels: number[];
    }
  >;
  spellcastingAbilities: Record<string, LabelledIndexEntry & { classIndexes: string[] }>;
  savingThrows: Record<string, LabelledIndexEntry & { classIndexes: string[] }>;
  proficiencies: Record<string, LabelledIndexEntry & { classIndexes: string[] }>;
};

function withMeta<T extends Record<string, unknown>>(base: T, opts?: BuilderMeta): T {
  return {
    ...base,
    ...(opts?.source ? { source: opts.source } : {}),
    ...(opts?.generatedAt ? { generatedAt: opts.generatedAt } : {}),
  };
}

function normalizeIndex(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

function toSlug(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value: unknown): string {
  return String(value || "")
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function addToSetRecord(record: Map<string, Set<string>>, key: string, value: string) {
  if (!key || !value) return;
  const existing = record.get(key);
  if (existing) {
    existing.add(value);
    return;
  }
  record.set(key, new Set([value]));
}

function sortIndexes(values: Iterable<string>, labelByIndex: Map<string, string>): string[] {
  return Array.from(new Set(values)).sort((left, right) =>
    String(labelByIndex.get(left) || left).localeCompare(
      String(labelByIndex.get(right) || right),
    ),
  );
}

function getNameMap(data: any[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of data || []) {
    const index = normalizeIndex(item?.index);
    if (!index) continue;
    map.set(index, String(item?.name || index).trim() || index);
  }
  return map;
}

function getDamageTypeMatchers(damageTypesData: any[]): Array<{ index: string; pattern: RegExp }> {
  const matchers: Array<{ index: string; pattern: RegExp }> = [];
  for (const damageType of damageTypesData || []) {
    const index = normalizeIndex(damageType?.index);
    const name = String(damageType?.name || index).trim().toLowerCase();
    if (!index || !name) continue;
    matchers.push({
      index,
      pattern: new RegExp(`\\b${escapeRegExp(name)}\\b`, "i"),
    });
  }
  return matchers;
}

function extractDamageTypeIndexes(
  value: unknown,
  damageTypeMatchers: Array<{ index: string; pattern: RegExp }>,
): string[] {
  if (typeof value !== "string") return [];
  const text = value.trim().toLowerCase();
  if (!text) return [];

  const indexes: string[] = [];
  for (const matcher of damageTypeMatchers) {
    if (matcher.pattern.test(text)) {
      indexes.push(matcher.index);
    }
  }
  return indexes;
}

function getMonsterDealtDamageTypeIndexes(monster: any): string[] {
  const indexes = new Set<string>();
  const groups = [monster?.actions, monster?.legendary_actions, monster?.special_abilities];
  for (const group of groups) {
    for (const item of group || []) {
      for (const damageEntry of item?.damage || []) {
        const damageTypeIndex = normalizeIndex(damageEntry?.damage_type?.index);
        if (damageTypeIndex) indexes.add(damageTypeIndex);
      }
    }
  }
  return Array.from(indexes);
}

function getMonsterLabelMap(monstersData: any[]): Map<string, string> {
  return getNameMap(monstersData);
}

function toCrSlug(value: string): string {
  if (value === "0.125") return "1-8";
  if (value === "0.25") return "1-4";
  if (value === "0.5") return "1-2";
  return value;
}

function formatCrLabel(value: string): string {
  if (value === "0.125") return "1/8";
  if (value === "0.25") return "1/4";
  if (value === "0.5") return "1/2";
  return value;
}

function resolveEquipmentIndexesForProficiency(proficiency: any, equipmentData: any[]): string[] {
  const indexes = new Set<string>();
  const referenceIndex = normalizeIndex(proficiency?.reference?.index);
  const referenceUrl = String(proficiency?.reference?.url || "").toLowerCase();

  if (referenceUrl.includes("/equipment/")) {
    const itemIndex = normalizeIndex(referenceUrl.split("/").pop());
    if (itemIndex) indexes.add(itemIndex);
  }

  if (referenceIndex === "light-armor") {
    for (const item of equipmentData || []) {
      if (String(item?.armor_category || "") === "Light") {
        indexes.add(normalizeIndex(item?.index));
      }
    }
  }
  if (referenceIndex === "medium-armor") {
    for (const item of equipmentData || []) {
      if (String(item?.armor_category || "") === "Medium") {
        indexes.add(normalizeIndex(item?.index));
      }
    }
  }
  if (referenceIndex === "heavy-armor") {
    for (const item of equipmentData || []) {
      if (String(item?.armor_category || "") === "Heavy") {
        indexes.add(normalizeIndex(item?.index));
      }
    }
  }
  if (referenceIndex === "shields") {
    for (const item of equipmentData || []) {
      if (String(item?.armor_category || "") === "Shield") {
        indexes.add(normalizeIndex(item?.index));
      }
    }
  }
  if (referenceIndex === "simple-weapons") {
    for (const item of equipmentData || []) {
      if (String(item?.weapon_category || "") === "Simple") {
        indexes.add(normalizeIndex(item?.index));
      }
    }
  }
  if (referenceIndex === "martial-weapons") {
    for (const item of equipmentData || []) {
      if (String(item?.weapon_category || "") === "Martial") {
        indexes.add(normalizeIndex(item?.index));
      }
    }
  }
  if (referenceIndex === "armor") {
    for (const item of equipmentData || []) {
      if (normalizeIndex(item?.equipment_category?.index) === "armor") {
        indexes.add(normalizeIndex(item?.index));
      }
    }
  }
  if (referenceIndex === "weapon") {
    for (const item of equipmentData || []) {
      if (normalizeIndex(item?.equipment_category?.index) === "weapon") {
        indexes.add(normalizeIndex(item?.index));
      }
    }
  }
  if (referenceIndex === "tools") {
    for (const item of equipmentData || []) {
      if (normalizeIndex(item?.equipment_category?.index) === "tools") {
        indexes.add(normalizeIndex(item?.index));
      }
    }
  }

  return Array.from(indexes).filter(Boolean);
}

export function buildDamageTypeRelationships(
  damageTypesData: any[],
  spellsData: any[],
  monstersData: any[],
  opts?: BuilderMeta,
): DamageTypeRelationshipsData {
  const spellLabelByIndex = getNameMap(spellsData);
  const monsterLabelByIndex = getMonsterLabelMap(monstersData);
  const damageTypeMatchers = getDamageTypeMatchers(damageTypesData);

  const records = new Map<
    string,
    {
      index: string;
      name: string;
      desc: string[];
      spellIndexes: Set<string>;
      spellIndexesByClass: Map<string, Set<string>>;
      spellIndexesByLevel: Map<string, Set<string>>;
      monsterDealIndexes: Set<string>;
      monsterResistanceIndexes: Set<string>;
      monsterImmunityIndexes: Set<string>;
      monsterVulnerabilityIndexes: Set<string>;
    }
  >();

  for (const damageType of damageTypesData || []) {
    const index = normalizeIndex(damageType?.index);
    if (!index) continue;
    records.set(index, {
      index,
      name: String(damageType?.name || index).trim() || index,
      desc: Array.isArray(damageType?.desc) ? damageType.desc : [],
      spellIndexes: new Set<string>(),
      spellIndexesByClass: new Map<string, Set<string>>(),
      spellIndexesByLevel: new Map<string, Set<string>>(),
      monsterDealIndexes: new Set<string>(),
      monsterResistanceIndexes: new Set<string>(),
      monsterImmunityIndexes: new Set<string>(),
      monsterVulnerabilityIndexes: new Set<string>(),
    });
  }

  for (const spell of spellsData || []) {
    const spellIndex = normalizeIndex(spell?.index);
    const damageTypeIndex = normalizeIndex(spell?.damage?.damage_type?.index);
    if (!spellIndex || !damageTypeIndex) continue;

    const record = records.get(damageTypeIndex);
    if (!record) continue;

    record.spellIndexes.add(spellIndex);

    const levelKey = String(Number(spell?.level));
    addToSetRecord(record.spellIndexesByLevel, levelKey, spellIndex);

    for (const cls of spell?.classes || []) {
      const classIndex = normalizeClassIndex(cls?.index);
      if (!classIndex) continue;
      addToSetRecord(record.spellIndexesByClass, classIndex, spellIndex);
    }
  }

  for (const monster of monstersData || []) {
    const monsterIndex = normalizeIndex(monster?.index);
    if (!monsterIndex) continue;

    for (const damageTypeIndex of getMonsterDealtDamageTypeIndexes(monster)) {
      const record = records.get(damageTypeIndex);
      if (record) record.monsterDealIndexes.add(monsterIndex);
    }

    for (const raw of monster?.damage_resistances || []) {
      for (const damageTypeIndex of extractDamageTypeIndexes(raw, damageTypeMatchers)) {
        const record = records.get(damageTypeIndex);
        if (record) record.monsterResistanceIndexes.add(monsterIndex);
      }
    }

    for (const raw of monster?.damage_immunities || []) {
      for (const damageTypeIndex of extractDamageTypeIndexes(raw, damageTypeMatchers)) {
        const record = records.get(damageTypeIndex);
        if (record) record.monsterImmunityIndexes.add(monsterIndex);
      }
    }

    for (const raw of monster?.damage_vulnerabilities || []) {
      for (const damageTypeIndex of extractDamageTypeIndexes(raw, damageTypeMatchers)) {
        const record = records.get(damageTypeIndex);
        if (record) record.monsterVulnerabilityIndexes.add(monsterIndex);
      }
    }
  }

  const damageTypes: Record<string, DamageTypeRelationshipEntry> = {};
  for (const [index, record] of records.entries()) {
    const byClass: Record<string, string[]> = {};
    for (const [classIndex, spellIndexes] of record.spellIndexesByClass.entries()) {
      byClass[classIndex] = sortIndexes(spellIndexes, spellLabelByIndex);
    }

    const byLevel: Record<string, string[]> = {};
    for (const [level, spellIndexes] of Array.from(record.spellIndexesByLevel.entries()).sort(
      (left, right) => Number(left[0]) - Number(right[0]),
    )) {
      byLevel[level] = sortIndexes(spellIndexes, spellLabelByIndex);
    }

    damageTypes[index] = {
      index,
      name: record.name,
      desc: record.desc,
      spells: {
        indexes: sortIndexes(record.spellIndexes, spellLabelByIndex),
        byClass,
        byLevel,
      },
      monsters: {
        dealsDamageIndexes: sortIndexes(record.monsterDealIndexes, monsterLabelByIndex),
        resistanceIndexes: sortIndexes(record.monsterResistanceIndexes, monsterLabelByIndex),
        immunityIndexes: sortIndexes(record.monsterImmunityIndexes, monsterLabelByIndex),
        vulnerabilityIndexes: sortIndexes(record.monsterVulnerabilityIndexes, monsterLabelByIndex),
      },
    };
  }

  return withMeta(
    {
      version: 1,
      damageTypes,
    },
    opts,
  );
}

export function buildSpellFacets(
  classesData: any[],
  spellsData: any[],
  opts?: BuilderMeta,
): SpellFacetsData {
  const spellLabelByIndex = getNameMap(spellsData);
  const damageTypeLabelByIndex = new Map<string, string>();
  const saveAbilityLabelByIndex = new Map<string, string>();

  const levels = new Map<string, { label: string; spellIndexes: Set<string> }>();
  const schools = new Map<string, { label: string; spellIndexes: Set<string> }>();
  const damageTypes = new Map<string, { label: string; spellIndexes: Set<string> }>();
  const tags = new Map<string, { label: string; spellIndexes: Set<string> }>();
  const components = new Map<string, { label: string; spellIndexes: Set<string> }>();
  const attackTypes = new Map<string, { label: string; spellIndexes: Set<string> }>();
  const savingThrows = new Map<string, { label: string; spellIndexes: Set<string> }>();
  const areaOfEffectTypes = new Map<string, { label: string; spellIndexes: Set<string> }>();

  const componentLabels: Record<string, string> = {
    v: "Verbal",
    s: "Somatic",
    m: "Material",
  };

  for (const spell of spellsData || []) {
    const spellIndex = normalizeIndex(spell?.index);
    if (!spellIndex) continue;

    const level = Number(spell?.level);
    if (Number.isInteger(level) && level >= 0) {
      const levelKey = String(level);
      const levelLabel = level === 0 ? "Cantrips" : `Level ${level}`;
      const existing = levels.get(levelKey);
      if (existing) {
        existing.spellIndexes.add(spellIndex);
      } else {
        levels.set(levelKey, { label: levelLabel, spellIndexes: new Set([spellIndex]) });
      }
    }

    const schoolIndex = normalizeIndex(spell?.school?.index);
    if (schoolIndex) {
      const existing = schools.get(schoolIndex);
      const label = String(spell?.school?.name || schoolIndex).trim() || schoolIndex;
      if (existing) {
        existing.spellIndexes.add(spellIndex);
      } else {
        schools.set(schoolIndex, { label, spellIndexes: new Set([spellIndex]) });
      }
    }

    const damageTypeIndex = normalizeIndex(spell?.damage?.damage_type?.index);
    if (damageTypeIndex) {
      const label = String(spell?.damage?.damage_type?.name || damageTypeIndex).trim();
      damageTypeLabelByIndex.set(damageTypeIndex, label || damageTypeIndex);
      const existing = damageTypes.get(damageTypeIndex);
      if (existing) {
        existing.spellIndexes.add(spellIndex);
      } else {
        damageTypes.set(damageTypeIndex, {
          label: label || damageTypeIndex,
          spellIndexes: new Set([spellIndex]),
        });
      }
    }

    const tagMappings: Array<{ key: string; enabled: boolean; label: string }> = [
      { key: "concentration", enabled: Boolean(spell?.concentration), label: "Concentration" },
      { key: "ritual", enabled: Boolean(spell?.ritual), label: "Ritual" },
      {
        key: "healing",
        enabled: Boolean(spell?.heal_at_slot_level),
        label: "Healing",
      },
      {
        key: "material",
        enabled: Boolean(spell?.material),
        label: "Material Component",
      },
    ];

    for (const tag of tagMappings) {
      if (!tag.enabled) continue;
      const existing = tags.get(tag.key);
      if (existing) {
        existing.spellIndexes.add(spellIndex);
      } else {
        tags.set(tag.key, { label: tag.label, spellIndexes: new Set([spellIndex]) });
      }
    }

    for (const component of spell?.components || []) {
      const componentIndex = normalizeIndex(component);
      if (!componentIndex) continue;
      const existing = components.get(componentIndex);
      const label = componentLabels[componentIndex] || componentIndex.toUpperCase();
      if (existing) {
        existing.spellIndexes.add(spellIndex);
      } else {
        components.set(componentIndex, { label, spellIndexes: new Set([spellIndex]) });
      }
    }

    const attackTypeIndex = normalizeIndex(spell?.attack_type);
    if (attackTypeIndex) {
      const existing = attackTypes.get(attackTypeIndex);
      const label = `${titleCase(attackTypeIndex)} Spell Attack`;
      if (existing) {
        existing.spellIndexes.add(spellIndex);
      } else {
        attackTypes.set(attackTypeIndex, { label, spellIndexes: new Set([spellIndex]) });
      }
    }

    const saveAbilityIndex = normalizeIndex(spell?.dc?.dc_type?.index);
    if (saveAbilityIndex) {
      const label = String(spell?.dc?.dc_type?.name || saveAbilityIndex).trim() || saveAbilityIndex;
      saveAbilityLabelByIndex.set(saveAbilityIndex, label);
      const existing = savingThrows.get(saveAbilityIndex);
      if (existing) {
        existing.spellIndexes.add(spellIndex);
      } else {
        savingThrows.set(saveAbilityIndex, {
          label,
          spellIndexes: new Set([spellIndex]),
        });
      }
    }

    const areaTypeIndex = toSlug(spell?.area_of_effect?.type);
    if (areaTypeIndex) {
      const label = `${titleCase(spell?.area_of_effect?.type)} Area`;
      const existing = areaOfEffectTypes.get(areaTypeIndex);
      if (existing) {
        existing.spellIndexes.add(spellIndex);
      } else {
        areaOfEffectTypes.set(areaTypeIndex, {
          label,
          spellIndexes: new Set([spellIndex]),
        });
      }
    }
  }

  const classIndex = buildSpellClassLevelIndex(classesData, spellsData, opts);

  const finalize = (
    record: Map<string, { label: string; spellIndexes: Set<string> }>,
  ): Record<string, LabelledIndexEntry & { spellIndexes: string[] }> => {
    const output: Record<string, LabelledIndexEntry & { spellIndexes: string[] }> = {};
    for (const [index, value] of record.entries()) {
      output[index] = {
        index,
        label: value.label,
        spellIndexes: sortIndexes(value.spellIndexes, spellLabelByIndex),
      };
    }
    return output;
  };

  const classes: Record<string, SpellClassFacetEntry> = {};
  for (const entry of Object.values(classIndex.classes)) {
    classes[entry.index] = {
      index: entry.index,
      label: entry.label,
      levels: entry.levels.slice(),
      spellIndexes: entry.spellIndexes.slice(),
      spellIndexesByLevel: { ...entry.spellIndexesByLevel },
    };
  }

  return withMeta(
    {
      version: 1,
      levels: finalize(levels),
      schools: finalize(schools),
      classes,
      damageTypes: finalize(damageTypes),
      tags: finalize(tags),
      components: finalize(components),
      attackTypes: finalize(attackTypes),
      savingThrows: finalize(savingThrows),
      areaOfEffectTypes: finalize(areaOfEffectTypes),
    },
    opts,
  );
}

export function buildMonsterFacets(
  monstersData: any[],
  conditionsData: any[],
  opts?: BuilderMeta,
): MonsterFacetsData {
  const monsterLabelByIndex = getMonsterLabelMap(monstersData);
  const conditionLabelByIndex = getNameMap(conditionsData);

  const types = new Map<string, { label: string; monsterIndexes: Set<string>; rawType: string }>();
  const challengeRatings = new Map<
    string,
    { label: string; value: string; monsterIndexes: Set<string> }
  >();
  const sizes = new Map<string, { label: string; monsterIndexes: Set<string> }>();
  const alignments = new Map<string, { label: string; monsterIndexes: Set<string> }>();
  const subtypes = new Map<string, { label: string; monsterIndexes: Set<string> }>();
  const senses = new Map<string, { label: string; monsterIndexes: Set<string> }>();
  const movementModes = new Map<string, { label: string; monsterIndexes: Set<string> }>();
  const conditionImmunities = new Map<string, { label: string; monsterIndexes: Set<string> }>();
  const tags = new Map<string, { label: string; monsterIndexes: Set<string> }>();

  for (const monster of monstersData || []) {
    const monsterIndex = normalizeIndex(monster?.index);
    if (!monsterIndex) continue;

    const typeSlug = toSlug(monster?.type);
    if (typeSlug) {
      const label = titleCase(monster?.type);
      const existing = types.get(typeSlug);
      if (existing) {
        existing.monsterIndexes.add(monsterIndex);
      } else {
        types.set(typeSlug, {
          label,
          monsterIndexes: new Set([monsterIndex]),
          rawType: String(monster?.type || "").trim().toLowerCase(),
        });
      }
    }

    const crValue = String(monster?.challenge_rating ?? "").trim();
    if (crValue) {
      const crSlug = toCrSlug(crValue);
      const existing = challengeRatings.get(crSlug);
      if (existing) {
        existing.monsterIndexes.add(monsterIndex);
      } else {
        challengeRatings.set(crSlug, {
          label: formatCrLabel(crValue),
          value: crValue,
          monsterIndexes: new Set([monsterIndex]),
        });
      }
    }

    const sizeIndex = toSlug(monster?.size);
    if (sizeIndex) {
      const existing = sizes.get(sizeIndex);
      const label = String(monster?.size || sizeIndex).trim() || sizeIndex;
      if (existing) {
        existing.monsterIndexes.add(monsterIndex);
      } else {
        sizes.set(sizeIndex, { label, monsterIndexes: new Set([monsterIndex]) });
      }
    }

    const alignmentIndex = toSlug(monster?.alignment);
    if (alignmentIndex) {
      const existing = alignments.get(alignmentIndex);
      const label = titleCase(monster?.alignment);
      if (existing) {
        existing.monsterIndexes.add(monsterIndex);
      } else {
        alignments.set(alignmentIndex, { label, monsterIndexes: new Set([monsterIndex]) });
      }
    }

    const subtypeIndex = toSlug(monster?.subtype);
    if (subtypeIndex) {
      const existing = subtypes.get(subtypeIndex);
      const label = titleCase(monster?.subtype);
      if (existing) {
        existing.monsterIndexes.add(monsterIndex);
      } else {
        subtypes.set(subtypeIndex, { label, monsterIndexes: new Set([monsterIndex]) });
      }
    }

    for (const [senseKey, senseValue] of Object.entries(monster?.senses || {})) {
      if (senseKey === "passive_perception" || !senseValue) continue;
      const senseIndex = toSlug(senseKey);
      const existing = senses.get(senseIndex);
      const label = titleCase(senseKey);
      if (existing) {
        existing.monsterIndexes.add(monsterIndex);
      } else {
        senses.set(senseIndex, { label, monsterIndexes: new Set([monsterIndex]) });
      }
    }

    for (const [speedKey, speedValue] of Object.entries(monster?.speed || {})) {
      if (speedKey === "hover" || !speedValue) continue;
      const speedIndex = toSlug(speedKey);
      const existing = movementModes.get(speedIndex);
      const label = titleCase(speedKey);
      if (existing) {
        existing.monsterIndexes.add(monsterIndex);
      } else {
        movementModes.set(speedIndex, { label, monsterIndexes: new Set([monsterIndex]) });
      }
    }

    for (const condition of monster?.condition_immunities || []) {
      const conditionIndex = normalizeIndex(condition?.index || condition?.name);
      if (!conditionIndex) continue;
      const existing = conditionImmunities.get(conditionIndex);
      const label =
        String(condition?.name || conditionLabelByIndex.get(conditionIndex) || conditionIndex).trim();
      if (existing) {
        existing.monsterIndexes.add(monsterIndex);
      } else {
        conditionImmunities.set(conditionIndex, {
          label,
          monsterIndexes: new Set([monsterIndex]),
        });
      }
    }

    const specialAbilityNames = (monster?.special_abilities || [])
      .map((item: any) => String(item?.name || "").toLowerCase())
      .filter(Boolean);
    if (
      specialAbilityNames.some(
        (name: string) => name === "spellcasting" || name.includes("innate spellcasting"),
      )
    ) {
      const existing = tags.get("spellcasting");
      if (existing) {
        existing.monsterIndexes.add(monsterIndex);
      } else {
        tags.set("spellcasting", {
          label: "Spellcasting Monsters",
          monsterIndexes: new Set([monsterIndex]),
        });
      }
    }
    if (Array.isArray(monster?.legendary_actions) && monster.legendary_actions.length > 0) {
      const existing = tags.get("legendary-actions");
      if (existing) {
        existing.monsterIndexes.add(monsterIndex);
      } else {
        tags.set("legendary-actions", {
          label: "Legendary Action Monsters",
          monsterIndexes: new Set([monsterIndex]),
        });
      }
    }
  }

  const finalize = <T extends { label: string; monsterIndexes: Set<string> }>(
    record: Map<string, T>,
    mapper: (index: string, value: T) => Record<string, unknown>,
  ): Record<string, any> => {
    const output: Record<string, any> = {};
    for (const [index, value] of record.entries()) {
      output[index] = {
        index,
        label: value.label,
        monsterIndexes: sortIndexes(value.monsterIndexes, monsterLabelByIndex),
        ...mapper(index, value),
      };
    }
    return output;
  };

  return withMeta(
    {
      version: 1,
      types: finalize(types, (_index, value) => ({ rawType: value.rawType })),
      challengeRatings: finalize(challengeRatings, (_index, value) => ({ value: value.value })),
      sizes: finalize(sizes, () => ({})),
      alignments: finalize(alignments, () => ({})),
      subtypes: finalize(subtypes, () => ({})),
      senses: finalize(senses, () => ({})),
      movementModes: finalize(movementModes, () => ({})),
      conditionImmunities: finalize(conditionImmunities, () => ({})),
      tags: finalize(tags, () => ({})),
    },
    opts,
  );
}

export function buildRaceRelationships(
  racesData: any[],
  subracesData: any[],
  traitsData: any[],
  languagesData: any[],
  opts?: BuilderMeta,
): RaceRelationshipsData {
  const raceLabelByIndex = getNameMap(racesData);
  const subraceLabelByIndex = getNameMap(subracesData);
  const abilityBonuses = new Map<
    string,
    {
      label: string;
      races: Array<{ index: string; bonus: number }>;
      subraces: Array<{ index: string; bonus: number; raceIndex: string; raceName: string }>;
    }
  >();
  const traits = new Map<
    string,
    { label: string; raceIndexes: Set<string>; subraceIndexes: Set<string> }
  >();
  const languages = new Map<string, { label: string; raceIndexes: Set<string> }>();
  const sizes = new Map<string, { label: string; raceIndexes: Set<string> }>();

  const traitLabelByIndex = getNameMap(traitsData);
  const languageLabelByIndex = getNameMap(languagesData);

  for (const race of racesData || []) {
    const raceIndex = normalizeIndex(race?.index);
    if (!raceIndex) continue;

    const sizeIndex = toSlug(race?.size);
    if (sizeIndex) {
      const existing = sizes.get(sizeIndex);
      const label = String(race?.size || sizeIndex).trim() || sizeIndex;
      if (existing) {
        existing.raceIndexes.add(raceIndex);
      } else {
        sizes.set(sizeIndex, { label, raceIndexes: new Set([raceIndex]) });
      }
    }

    for (const language of race?.languages || []) {
      const languageIndex = normalizeIndex(language?.index);
      if (!languageIndex) continue;
      const label =
        String(language?.name || languageLabelByIndex.get(languageIndex) || languageIndex).trim();
      const existing = languages.get(languageIndex);
      if (existing) {
        existing.raceIndexes.add(raceIndex);
      } else {
        languages.set(languageIndex, { label, raceIndexes: new Set([raceIndex]) });
      }
    }

    for (const bonus of race?.ability_bonuses || []) {
      const abilityIndex = normalizeIndex(bonus?.ability_score?.index);
      if (!abilityIndex) continue;
      const existing = abilityBonuses.get(abilityIndex);
      const label = String(bonus?.ability_score?.name || abilityIndex).trim() || abilityIndex;
      const raceEntry = { index: raceIndex, bonus: Number(bonus?.bonus) || 0 };
      if (existing) {
        existing.races.push(raceEntry);
      } else {
        abilityBonuses.set(abilityIndex, {
          label,
          races: [raceEntry],
          subraces: [],
        });
      }
    }

    for (const traitRef of race?.traits || []) {
      const traitIndex = normalizeIndex(traitRef?.index);
      if (!traitIndex) continue;
      const label = String(traitRef?.name || traitLabelByIndex.get(traitIndex) || traitIndex).trim();
      const existing = traits.get(traitIndex);
      if (existing) {
        existing.raceIndexes.add(raceIndex);
      } else {
        traits.set(traitIndex, {
          label,
          raceIndexes: new Set([raceIndex]),
          subraceIndexes: new Set<string>(),
        });
      }
    }
  }

  for (const subrace of subracesData || []) {
    const subraceIndex = normalizeIndex(subrace?.index);
    const raceIndex = normalizeIndex(subrace?.race?.index);
    if (!subraceIndex) continue;

    const raceName =
      String(subrace?.race?.name || raceLabelByIndex.get(raceIndex) || raceIndex).trim() || raceIndex;

    for (const bonus of subrace?.ability_bonuses || []) {
      const abilityIndex = normalizeIndex(bonus?.ability_score?.index);
      if (!abilityIndex) continue;
      const existing = abilityBonuses.get(abilityIndex);
      const label = String(bonus?.ability_score?.name || abilityIndex).trim() || abilityIndex;
      const subraceEntry = {
        index: subraceIndex,
        bonus: Number(bonus?.bonus) || 0,
        raceIndex,
        raceName,
      };
      if (existing) {
        existing.subraces.push(subraceEntry);
      } else {
        abilityBonuses.set(abilityIndex, {
          label,
          races: [],
          subraces: [subraceEntry],
        });
      }
    }

    for (const traitRef of subrace?.racial_traits || []) {
      const traitIndex = normalizeIndex(traitRef?.index);
      if (!traitIndex) continue;
      const label = String(traitRef?.name || traitLabelByIndex.get(traitIndex) || traitIndex).trim();
      const existing = traits.get(traitIndex);
      if (existing) {
        existing.subraceIndexes.add(subraceIndex);
      } else {
        traits.set(traitIndex, {
          label,
          raceIndexes: new Set<string>(),
          subraceIndexes: new Set([subraceIndex]),
        });
      }
    }
  }

  const traitOutput: RaceRelationshipsData["traits"] = {};
  for (const [index, value] of traits.entries()) {
    traitOutput[index] = {
      index,
      label: value.label,
      raceIndexes: sortIndexes(value.raceIndexes, raceLabelByIndex),
      subraceIndexes: sortIndexes(value.subraceIndexes, subraceLabelByIndex),
    };
  }

  const languageOutput: RaceRelationshipsData["languages"] = {};
  for (const [index, value] of languages.entries()) {
    languageOutput[index] = {
      index,
      label: value.label,
      raceIndexes: sortIndexes(value.raceIndexes, raceLabelByIndex),
    };
  }

  const abilityBonusOutput: RaceRelationshipsData["abilityBonuses"] = {};
  for (const [index, value] of abilityBonuses.entries()) {
    abilityBonusOutput[index] = {
      index,
      label: value.label,
      races: value.races
        .slice()
        .sort(
          (left, right) =>
            String(raceLabelByIndex.get(left.index) || left.index).localeCompare(
              String(raceLabelByIndex.get(right.index) || right.index),
            ) || right.bonus - left.bonus,
        ),
      subraces: value.subraces
        .slice()
        .sort(
          (left, right) =>
            String(subraceLabelByIndex.get(left.index) || left.index).localeCompare(
              String(subraceLabelByIndex.get(right.index) || right.index),
            ) || right.bonus - left.bonus,
        ),
    };
  }

  const sizeOutput: RaceRelationshipsData["sizes"] = {};
  for (const [index, value] of sizes.entries()) {
    sizeOutput[index] = {
      index,
      label: value.label,
      raceIndexes: sortIndexes(value.raceIndexes, raceLabelByIndex),
    };
  }

  return withMeta(
    {
      version: 1,
      traits: traitOutput,
      languages: languageOutput,
      abilityBonuses: abilityBonusOutput,
      sizes: sizeOutput,
    },
    opts,
  );
}

export function buildEquipmentFacets(
  equipmentData: any[],
  magicItemsData: any[],
  proficienciesData: any[],
  opts?: BuilderMeta,
): EquipmentFacetsData {
  const equipmentLabelByIndex = getNameMap(equipmentData);
  const magicItemLabelByIndex = getNameMap(magicItemsData);
  const combinedLabelByIndex = new Map<string, string>([
    ...equipmentLabelByIndex.entries(),
    ...magicItemLabelByIndex.entries(),
  ]);

  const categories = new Map<string, { label: string; itemIndexes: Set<string> }>();
  const armorCategories = new Map<string, { label: string; itemIndexes: Set<string> }>();
  const weaponCategories = new Map<string, { label: string; itemIndexes: Set<string> }>();
  const weaponRanges = new Map<string, { label: string; itemIndexes: Set<string> }>();
  const gearCategories = new Map<string, { label: string; itemIndexes: Set<string> }>();
  const toolCategories = new Map<string, { label: string; itemIndexes: Set<string> }>();
  const weaponProperties = new Map<string, { label: string; itemIndexes: Set<string> }>();
  const magicItemRarities = new Map<string, { label: string; itemIndexes: Set<string> }>();
  const proficiencies = new Map<string, { label: string; itemIndexes: Set<string> }>();

  for (const item of equipmentData || []) {
    const itemIndex = normalizeIndex(item?.index);
    if (!itemIndex) continue;

    const categoryIndex = normalizeIndex(item?.equipment_category?.index);
    if (categoryIndex) {
      const existing = categories.get(categoryIndex);
      const label = String(item?.equipment_category?.name || categoryIndex).trim() || categoryIndex;
      if (existing) {
        existing.itemIndexes.add(itemIndex);
      } else {
        categories.set(categoryIndex, { label, itemIndexes: new Set([itemIndex]) });
      }
    }

    const armorCategoryIndex = toSlug(item?.armor_category);
    if (armorCategoryIndex) {
      const existing = armorCategories.get(armorCategoryIndex);
      const label = String(item?.armor_category || armorCategoryIndex).trim() || armorCategoryIndex;
      if (existing) {
        existing.itemIndexes.add(itemIndex);
      } else {
        armorCategories.set(armorCategoryIndex, {
          label,
          itemIndexes: new Set([itemIndex]),
        });
      }
    }

    const weaponCategoryIndex = toSlug(item?.weapon_category);
    if (weaponCategoryIndex) {
      const existing = weaponCategories.get(weaponCategoryIndex);
      const label = String(item?.weapon_category || weaponCategoryIndex).trim() || weaponCategoryIndex;
      if (existing) {
        existing.itemIndexes.add(itemIndex);
      } else {
        weaponCategories.set(weaponCategoryIndex, {
          label,
          itemIndexes: new Set([itemIndex]),
        });
      }
    }

    const weaponRangeIndex = toSlug(item?.weapon_range);
    if (weaponRangeIndex) {
      const existing = weaponRanges.get(weaponRangeIndex);
      const label = String(item?.weapon_range || weaponRangeIndex).trim() || weaponRangeIndex;
      if (existing) {
        existing.itemIndexes.add(itemIndex);
      } else {
        weaponRanges.set(weaponRangeIndex, { label, itemIndexes: new Set([itemIndex]) });
      }
    }

    const gearCategoryIndex = normalizeIndex(item?.gear_category?.index);
    if (gearCategoryIndex) {
      const existing = gearCategories.get(gearCategoryIndex);
      const label = String(item?.gear_category?.name || gearCategoryIndex).trim() || gearCategoryIndex;
      if (existing) {
        existing.itemIndexes.add(itemIndex);
      } else {
        gearCategories.set(gearCategoryIndex, {
          label,
          itemIndexes: new Set([itemIndex]),
        });
      }
    }

    const toolCategoryIndex = toSlug(item?.tool_category);
    if (toolCategoryIndex) {
      const existing = toolCategories.get(toolCategoryIndex);
      const label = String(item?.tool_category || toolCategoryIndex).trim() || toolCategoryIndex;
      if (existing) {
        existing.itemIndexes.add(itemIndex);
      } else {
        toolCategories.set(toolCategoryIndex, { label, itemIndexes: new Set([itemIndex]) });
      }
    }

    for (const property of item?.properties || []) {
      const propertyIndex = normalizeIndex(property?.index);
      if (!propertyIndex) continue;
      const existing = weaponProperties.get(propertyIndex);
      const label = String(property?.name || propertyIndex).trim() || propertyIndex;
      if (existing) {
        existing.itemIndexes.add(itemIndex);
      } else {
        weaponProperties.set(propertyIndex, { label, itemIndexes: new Set([itemIndex]) });
      }
    }
  }

  for (const item of magicItemsData || []) {
    const itemIndex = normalizeIndex(item?.index);
    if (!itemIndex) continue;

    const rarityIndex = normalizeIndex(item?.rarity?.name || item?.rarity);
    if (!rarityIndex) continue;
    const existing = magicItemRarities.get(rarityIndex);
    const label = String(item?.rarity?.name || rarityIndex).trim() || rarityIndex;
    if (existing) {
      existing.itemIndexes.add(itemIndex);
    } else {
      magicItemRarities.set(rarityIndex, { label, itemIndexes: new Set([itemIndex]) });
    }
  }

  for (const proficiency of proficienciesData || []) {
    const proficiencyIndex = normalizeIndex(proficiency?.index);
    if (!proficiencyIndex) continue;
    const itemIndexes = resolveEquipmentIndexesForProficiency(proficiency, equipmentData);
    if (!itemIndexes.length) continue;

    const existing = proficiencies.get(proficiencyIndex);
    const label = String(proficiency?.name || proficiencyIndex).trim() || proficiencyIndex;
    if (existing) {
      for (const itemIndex of itemIndexes) {
        existing.itemIndexes.add(itemIndex);
      }
    } else {
      proficiencies.set(proficiencyIndex, {
        label,
        itemIndexes: new Set(itemIndexes),
      });
    }
  }

  const finalize = (
    record: Map<string, { label: string; itemIndexes: Set<string> }>,
  ): Record<string, LabelledIndexEntry & { itemIndexes: string[] }> => {
    const output: Record<string, LabelledIndexEntry & { itemIndexes: string[] }> = {};
    for (const [index, value] of record.entries()) {
      output[index] = {
        index,
        label: value.label,
        itemIndexes: sortIndexes(value.itemIndexes, combinedLabelByIndex),
      };
    }
    return output;
  };

  return withMeta(
    {
      version: 1,
      categories: finalize(categories),
      armorCategories: finalize(armorCategories),
      weaponCategories: finalize(weaponCategories),
      weaponRanges: finalize(weaponRanges),
      gearCategories: finalize(gearCategories),
      toolCategories: finalize(toolCategories),
      weaponProperties: finalize(weaponProperties),
      magicItemRarities: finalize(magicItemRarities),
      proficiencies: finalize(proficiencies),
    },
    opts,
  );
}

export function buildClassRelationships(
  classesData: any[],
  featuresData: any[],
  proficienciesData: any[],
  spellsData: any[],
  opts?: BuilderMeta,
): ClassRelationshipsData {
  const classLabelByIndex = getNameMap(classesData);
  const featureLabelByIndex = getNameMap(featuresData);
  const proficiencyLabelByIndex = getNameMap(proficienciesData);
  const spellClassIndex = buildSpellClassLevelIndex(classesData, spellsData, opts);

  const classes: ClassRelationshipsData["classes"] = {};
  const spellcastingAbilities = new Map<string, { label: string; classIndexes: Set<string> }>();
  const savingThrows = new Map<string, { label: string; classIndexes: Set<string> }>();
  const proficiencies = new Map<string, { label: string; classIndexes: Set<string> }>();

  const featureIndexesByClass = new Map<string, Map<string, Set<string>>>();
  for (const feature of featuresData || []) {
    const classIndex = normalizeClassIndex(feature?.class?.index);
    const featureIndex = normalizeIndex(feature?.index);
    if (!classIndex || !featureIndex) continue;
    const levelKey = String(Number(feature?.level));
    const existing = featureIndexesByClass.get(classIndex);
    if (existing) {
      addToSetRecord(existing, levelKey, featureIndex);
    } else {
      const record = new Map<string, Set<string>>();
      addToSetRecord(record, levelKey, featureIndex);
      featureIndexesByClass.set(classIndex, record);
    }
  }

  for (const classItem of classesData || []) {
    const classIndex = normalizeClassIndex(classItem?.index);
    if (!classIndex) continue;

    const spellEntry = spellClassIndex.classes[classIndex];
    const featureLevels = featureIndexesByClass.get(classIndex) || new Map<string, Set<string>>();
    const featureIndexesByLevel: Record<string, string[]> = {};
    for (const [level, featureIndexes] of Array.from(featureLevels.entries()).sort(
      (left, right) => Number(left[0]) - Number(right[0]),
    )) {
      featureIndexesByLevel[level] = sortIndexes(featureIndexes, featureLabelByIndex);
    }

    const spellcastingAbilityIndex = normalizeIndex(
      classItem?.spellcasting?.spellcasting_ability?.index,
    );
    const spellcastingAbility = spellcastingAbilityIndex
      ? {
          index: spellcastingAbilityIndex,
          label:
            String(classItem?.spellcasting?.spellcasting_ability?.name || spellcastingAbilityIndex)
              .trim() || spellcastingAbilityIndex,
        }
      : null;

    if (spellcastingAbility) {
      const existing = spellcastingAbilities.get(spellcastingAbility.index);
      if (existing) {
        existing.classIndexes.add(classIndex);
      } else {
        spellcastingAbilities.set(spellcastingAbility.index, {
          label: spellcastingAbility.label,
          classIndexes: new Set([classIndex]),
        });
      }
    }

    const savingThrowIndexes = (classItem?.saving_throws || [])
      .map((save: any) => normalizeIndex(save?.index))
      .filter(Boolean);
    for (const save of classItem?.saving_throws || []) {
      const saveIndex = normalizeIndex(save?.index);
      if (!saveIndex) continue;
      const label = String(save?.name || saveIndex).trim() || saveIndex;
      const existing = savingThrows.get(saveIndex);
      if (existing) {
        existing.classIndexes.add(classIndex);
      } else {
        savingThrows.set(saveIndex, { label, classIndexes: new Set([classIndex]) });
      }
    }

    const proficiencyIndexes = (classItem?.proficiencies || [])
      .map((proficiency: any) => normalizeIndex(proficiency?.index))
      .filter(Boolean);
    for (const proficiency of classItem?.proficiencies || []) {
      const proficiencyIndex = normalizeIndex(proficiency?.index);
      if (!proficiencyIndex) continue;
      const label =
        String(proficiency?.name || proficiencyLabelByIndex.get(proficiencyIndex) || proficiencyIndex)
          .trim() || proficiencyIndex;
      const existing = proficiencies.get(proficiencyIndex);
      if (existing) {
        existing.classIndexes.add(classIndex);
      } else {
        proficiencies.set(proficiencyIndex, {
          label,
          classIndexes: new Set([classIndex]),
        });
      }
    }

    const startingEquipmentIndexes = (classItem?.starting_equipment || [])
      .map((item: any) => normalizeIndex(item?.equipment?.index))
      .filter(Boolean);

    const subclassIndexes = (classItem?.subclasses || [])
      .map((subclass: any) => normalizeIndex(subclass?.index))
      .filter(Boolean);

    classes[classIndex] = {
      index: classIndex,
      label: String(classItem?.name || classIndex).trim() || classIndex,
      spellcastingAbility,
      savingThrowIndexes,
      proficiencyIndexes,
      startingEquipmentIndexes: startingEquipmentIndexes.sort(),
      featureIndexesByLevel,
      subclassIndexes: subclassIndexes.sort(),
      spellCount: spellEntry ? spellEntry.spellIndexes.length : 0,
      spellLevels: spellEntry ? spellEntry.levels.slice() : [],
    };
  }

  const finalizeClassIndex = (
    record: Map<string, { label: string; classIndexes: Set<string> }>,
  ): Record<string, LabelledIndexEntry & { classIndexes: string[] }> => {
    const output: Record<string, LabelledIndexEntry & { classIndexes: string[] }> = {};
    for (const [index, value] of record.entries()) {
      output[index] = {
        index,
        label: value.label,
        classIndexes: sortIndexes(value.classIndexes, classLabelByIndex),
      };
    }
    return output;
  };

  return withMeta(
    {
      version: 1,
      classes,
      spellcastingAbilities: finalizeClassIndex(spellcastingAbilities),
      savingThrows: finalizeClassIndex(savingThrows),
      proficiencies: finalizeClassIndex(proficiencies),
    },
    opts,
  );
}
