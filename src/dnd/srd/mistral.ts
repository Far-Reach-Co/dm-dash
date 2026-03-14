import { Mistral } from "@mistralai/mistralai";
import { detectCategories, srdData } from "./data.js";
import { findRelevantEntries } from "./indexer.js";
import { SERIALIZERS, serializeGeneric } from "./serializers.js";
import {
  getClassesForSpellcastingAbility,
  getDamageTypeRelationship,
  getMonsterConditionImmunityOptions,
  getMonsterMovementModeOptions,
  getMonsterSenseOptions,
  getSpellDamageTypeOptionsForClass,
  getSpellRaceAccess,
  getSpellSchoolOptionsForClass,
  getMonstersForConditionImmunity,
  getMonstersForMonsterType,
  getMonstersForMovementMode,
  getMonstersForSense,
  getMonsterTypeOptions,
  getRelatedDamageTypesForMonster,
  getSpellsForClass,
  getSpellsForDamageType,
} from "../srdCatalog.js";
import { redisClient } from "../../lib/socketUsers.js";
import {
  normalizeSearchContextHint,
  type SearchContextHint,
  type NormalizedSearchContext,
} from "./context.js";

// ── Mistral API ───────────────────────────────────────────────────────────────

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function summarizeNames(values: Array<string | null | undefined>, max = 12): string {
  const filtered = values.filter((value): value is string => Boolean(value && value.trim()));
  if (!filtered.length) return "";
  const slice = filtered.slice(0, max);
  const suffix = filtered.length > max ? `, and ${filtered.length - max} more` : "";
  return `${slice.join(", ")}${suffix}`;
}

function findDamageTypeIndex(query: string, context: NormalizedSearchContext | null): string | null {
  if (context?.category === "damage-types" && context.index) return context.index;
  const lower = query.toLowerCase();
  for (const damageType of srdData["damage-types"] || []) {
    const index = String(damageType?.index || "").trim().toLowerCase();
    const name = String(damageType?.name || "").trim().toLowerCase();
    if (!index || !name) continue;
    const pattern = new RegExp(`\\b${escapeForRegex(name)}\\b`, "i");
    if (pattern.test(lower) || lower.includes(index)) return index;
  }
  return null;
}

function findClassIndex(query: string, context: NormalizedSearchContext | null): string | null {
  if (context?.category === "classes" && context.index) return context.index;
  const lower = query.toLowerCase();
  for (const classEntry of srdData.classes || []) {
    const index = String(classEntry?.index || "").trim().toLowerCase();
    const name = String(classEntry?.name || "").trim().toLowerCase();
    if (!index || !name) continue;
    const pattern = new RegExp(`\\b${escapeForRegex(name)}\\b`, "i");
    if (pattern.test(lower) || lower.includes(index)) return index;
  }
  return null;
}

function findAbilityIndex(query: string): string | null {
  const lower = query.toLowerCase();
  const aliases: Record<string, string[]> = {
    str: ["strength", "str"],
    dex: ["dexterity", "dex"],
    con: ["constitution", "con"],
    int: ["intelligence", "int"],
    wis: ["wisdom", "wis"],
    cha: ["charisma", "cha"],
  };

  for (const [index, values] of Object.entries(aliases)) {
    if (
      values.some((value) => new RegExp(`\\b${escapeForRegex(value)}\\b`, "i").test(lower))
    ) {
      return index;
    }
  }
  return null;
}

function getPathFacetIndex(
  context: NormalizedSearchContext | null,
  prefix: string,
): string | null {
  if (!context?.path || !context.path.startsWith(prefix)) return null;
  const tail = context.path.slice(prefix.length).split("/")[0] || "";
  const normalized = tail.trim().toLowerCase();
  return normalized || null;
}

function findMonsterTypeFacetIndex(
  query: string,
  context: NormalizedSearchContext | null,
): string | null {
  const fromPath = getPathFacetIndex(context, "/dnd/5e/srd/monsters/type/");
  if (fromPath) return fromPath;

  const lower = query.toLowerCase();
  for (const option of getMonsterTypeOptions()) {
    const typePattern = new RegExp(`\\b${escapeForRegex(option.type.toLowerCase())}\\b`, "i");
    const labelPattern = new RegExp(`\\b${escapeForRegex(option.label.toLowerCase())}\\b`, "i");
    if (typePattern.test(lower) || labelPattern.test(lower) || lower.includes(option.slug)) {
      return option.slug;
    }
  }
  return null;
}

function findMonsterConditionImmunityFacetIndex(
  query: string,
  context: NormalizedSearchContext | null,
): string | null {
  const fromPath = getPathFacetIndex(
    context,
    "/dnd/5e/srd/monsters/condition-immunity/",
  );
  if (fromPath) return fromPath;

  const lower = query.toLowerCase();
  for (const option of getMonsterConditionImmunityOptions()) {
    const pattern = new RegExp(`\\b${escapeForRegex(option.label.toLowerCase())}\\b`, "i");
    if (pattern.test(lower) || lower.includes(option.index)) return option.index;
  }
  return null;
}

function findMonsterSenseFacetIndex(query: string): string | null {
  const lower = query.toLowerCase();
  for (const option of getMonsterSenseOptions()) {
    const pattern = new RegExp(`\\b${escapeForRegex(option.label.toLowerCase())}\\b`, "i");
    if (pattern.test(lower) || lower.includes(option.index)) return option.index;
  }
  return null;
}

function findMonsterMovementModeFacetIndex(query: string): string | null {
  const lower = query.toLowerCase();
  const aliases: Record<string, string[]> = {
    walk: ["walk", "walking"],
    fly: ["fly", "flying", "hover"],
    swim: ["swim", "swimming"],
    climb: ["climb", "climbing"],
    burrow: ["burrow", "burrowing"],
  };

  for (const option of getMonsterMovementModeOptions()) {
    const values = aliases[option.index] || [option.index, option.label.toLowerCase()];
    if (values.some((value) => new RegExp(`\\b${escapeForRegex(value)}\\b`, "i").test(lower))) {
      return option.index;
    }
  }
  return null;
}

function intersectMonsterEntries(current: any[] | null, next: any[]): any[] {
  if (!current) return next.slice();
  const nextIndexes = new Set(
    next
      .map((monster: any) => String(monster?.index || "").trim().toLowerCase())
      .filter(Boolean),
  );
  return current.filter((monster: any) =>
    nextIndexes.has(String(monster?.index || "").trim().toLowerCase()),
  );
}

function resolveMonsterFacetMatch(
  query: string,
  context: NormalizedSearchContext | null,
): {
  monsters: any[];
  monsterTypeFacetIndex: string | null;
  monsterConditionImmunityFacetIndex: string | null;
  monsterSenseFacetIndex: string | null;
  monsterMovementFacetIndex: string | null;
  typeLabel: string | null;
  conditionLabel: string | null;
  senseLabel: string | null;
  movementLabel: string | null;
} | null {
  const lower = query.toLowerCase();
  const monsterTypeFacetIndex = findMonsterTypeFacetIndex(query, context);
  const monsterConditionImmunityFacetIndex = findMonsterConditionImmunityFacetIndex(
    query,
    context,
  );
  const monsterSenseFacetIndex = findMonsterSenseFacetIndex(query);
  const monsterMovementFacetIndex = findMonsterMovementModeFacetIndex(query);
  const monsterBrowseIntent =
    /\bmonster|monsters|creature|creatures\b/.test(lower) ||
    context?.path?.startsWith("/dnd/5e/srd/monsters/type/") ||
    context?.path?.startsWith("/dnd/5e/srd/monsters/cr/") ||
    context?.path?.startsWith("/dnd/5e/srd/monsters/condition-immunity/");

  if (
    !monsterBrowseIntent ||
    !(
      monsterTypeFacetIndex ||
      monsterConditionImmunityFacetIndex ||
      monsterSenseFacetIndex ||
      monsterMovementFacetIndex
    )
  ) {
    return null;
  }

  let monsters: any[] | null = null;

  if (monsterTypeFacetIndex) {
    monsters = intersectMonsterEntries(monsters, getMonstersForMonsterType(monsterTypeFacetIndex));
  }
  if (monsterConditionImmunityFacetIndex) {
    monsters = intersectMonsterEntries(
      monsters,
      getMonstersForConditionImmunity(monsterConditionImmunityFacetIndex),
    );
  }
  if (monsterSenseFacetIndex) {
    monsters = intersectMonsterEntries(monsters, getMonstersForSense(monsterSenseFacetIndex));
  }
  if (monsterMovementFacetIndex) {
    monsters = intersectMonsterEntries(
      monsters,
      getMonstersForMovementMode(monsterMovementFacetIndex),
    );
  }

  return {
    monsters: monsters || [],
    monsterTypeFacetIndex,
    monsterConditionImmunityFacetIndex,
    monsterSenseFacetIndex,
    monsterMovementFacetIndex,
    typeLabel:
      getMonsterTypeOptions().find((option) => option.slug === monsterTypeFacetIndex)?.label ||
      null,
    conditionLabel:
      getMonsterConditionImmunityOptions().find(
        (option) => option.index === monsterConditionImmunityFacetIndex,
      )?.label || null,
    senseLabel:
      getMonsterSenseOptions().find((option) => option.index === monsterSenseFacetIndex)?.label ||
      null,
    movementLabel:
      getMonsterMovementModeOptions().find(
        (option) => option.index === monsterMovementFacetIndex,
      )?.label || null,
  };
}

function resolveSpellFacetMatch(
  query: string,
  context: NormalizedSearchContext | null,
): {
  spells: any[];
  classIndex: string | null;
  classLabel: string | null;
  damageTypeIndex: string | null;
  damageTypeName: string | null;
  spellBrowseIntent: boolean;
} | null {
  const lower = query.toLowerCase();
  const classIndex = getPathFacetIndex(context, "/dnd/5e/srd/spells/class/") || findClassIndex(query, context);
  const damageTypeIndex =
    getPathFacetIndex(context, "/dnd/5e/srd/spells/damage/") || findDamageTypeIndex(query, context);
  const spellBrowseIntent =
    /\bspell|spells|cantrip|cantrips\b/.test(lower) ||
    context?.path?.startsWith("/dnd/5e/srd/spells/") ||
    context?.category === "spells";

  if (!spellBrowseIntent || (!classIndex && !damageTypeIndex)) {
    return null;
  }

  const classLabel = classIndex
    ? String(
        (srdData.classes || []).find(
          (item: any) => String(item?.index || "").toLowerCase() === classIndex,
        )?.name || classIndex,
      )
    : null;

  let spells: any[] = [];
  if (damageTypeIndex) {
    spells = getSpellsForDamageType(damageTypeIndex);
    if (classIndex) {
      spells = spells.filter((spell: any) =>
        Array.isArray(spell?.classes) &&
        spell.classes.some(
          (cls: any) => String(cls?.index || "").trim().toLowerCase() === classIndex,
        ),
      );
    }
  } else if (classIndex) {
    spells = getSpellsForClass(classIndex);
  }

  const damageTypeName = damageTypeIndex
    ? String(
        (srdData["damage-types"] || []).find(
          (item: any) => String(item?.index || "").toLowerCase() === damageTypeIndex,
        )?.name || damageTypeIndex,
      )
    : null;

  return {
    spells,
    classIndex,
    classLabel,
    damageTypeIndex,
    damageTypeName,
    spellBrowseIntent,
  };
}

function buildDerivedQueryContext(
  query: string,
  context: NormalizedSearchContext | null,
): string | null {
  const lower = query.toLowerCase();
  const lines: string[] = [];
  const classIndex = findClassIndex(query, context);
  const damageTypeIndex = findDamageTypeIndex(query, context);
  const abilityIndex = findAbilityIndex(query);
  const monsterFacetMatch = resolveMonsterFacetMatch(query, context);
  const spellFacetMatch = resolveSpellFacetMatch(query, context);
  const classLabel = classIndex
    ? String(
        (srdData.classes || []).find((item: any) => String(item?.index || "").toLowerCase() === classIndex)
          ?.name || classIndex,
      )
    : null;
  const specificMonsterPage = context?.category === "monsters" && Boolean(context?.index);
  const monsterBrowseIntent =
    /\bmonster|monsters|creature|creatures\b/.test(lower) ||
    context?.path?.startsWith("/dnd/5e/srd/monsters/type/") ||
    context?.path?.startsWith("/dnd/5e/srd/monsters/cr/") ||
    context?.path?.startsWith("/dnd/5e/srd/monsters/condition-immunity/");

  if (monsterFacetMatch) {
    const descriptionParts = [
      monsterFacetMatch.typeLabel ? `${monsterFacetMatch.typeLabel} monsters` : "SRD monsters",
      monsterFacetMatch.conditionLabel
        ? `immune to the ${monsterFacetMatch.conditionLabel.toLowerCase()} condition`
        : null,
      monsterFacetMatch.senseLabel
        ? `with ${monsterFacetMatch.senseLabel.toLowerCase()}`
        : null,
      monsterFacetMatch.movementLabel
        ? `with a ${monsterFacetMatch.movementLabel.toLowerCase()} speed`
        : null,
    ].filter(Boolean);

    lines.push(
      `Derived monster facet: ${descriptionParts.join(" ")}: ${monsterFacetMatch.monsters.length}.`,
    );
    if (monsterFacetMatch.monsters.length) {
      lines.push(
        `Monster examples: ${summarizeNames(
          monsterFacetMatch.monsters.map((monster: any) => monster?.name),
          14,
        )}.`,
      );
    }
    if (monsterFacetMatch.monsterTypeFacetIndex) {
      lines.push(`Relevant page: /dnd/5e/srd/monsters/type/${monsterFacetMatch.monsterTypeFacetIndex}`);
    }
    if (monsterFacetMatch.monsterConditionImmunityFacetIndex) {
      lines.push(
        `Relevant page: /dnd/5e/srd/monsters/condition-immunity/${monsterFacetMatch.monsterConditionImmunityFacetIndex}`,
      );
    }
  }

  if (classIndex && /\bdamage\b/.test(lower)) {
    const classDamageTypes = getSpellDamageTypeOptionsForClass(classIndex).slice(0, 8);
    if (classDamageTypes.length) {
      lines.push(
        `Derived class spell damage types for ${classLabel}: ${classDamageTypes
          .map((item) => `${item.label} (${item.count})`)
          .join(", ")}.`,
      );
    }
  }

  if (classIndex && /\bschool|schools\b/.test(lower)) {
    const classSchools = getSpellSchoolOptionsForClass(classIndex).slice(0, 8);
    if (classSchools.length) {
      lines.push(
        `Derived class spell schools for ${classLabel}: ${classSchools
          .map((item) => `${item.label} (${item.count})`)
          .join(", ")}.`,
      );
    }
  }

  if (spellFacetMatch && spellFacetMatch.damageTypeIndex) {
    const examples = summarizeNames(spellFacetMatch.spells.map((spell: any) => spell?.name), 14);
    lines.push(
      `Derived spell facet: ${spellFacetMatch.classLabel ? `${spellFacetMatch.classLabel} ` : ""}${spellFacetMatch.damageTypeName} damage spells in SRD: ${spellFacetMatch.spells.length}.`,
    );
    lines.push(`Relevant page: /dnd/5e/srd/spells/damage/${spellFacetMatch.damageTypeIndex}`);
    if (examples) lines.push(`Spell examples: ${examples}.`);
  }

  if (
    damageTypeIndex &&
    (monsterBrowseIntent ||
      (!specificMonsterPage &&
        /\bimmune|immunity|resistant|resistance|vulnerable|vulnerability\b/.test(lower)) ||
      context?.category === "damage-types")
  ) {
    const relationship = getDamageTypeRelationship(damageTypeIndex);
    if (relationship) {
      const wantsResistance = /\bresist|resistance|resistant\b/.test(lower);
      const wantsImmunity = /\bimmune|immunity\b/.test(lower);
      const wantsVulnerability = /\bvulnerable|vulnerability\b/.test(lower);
      const wantsDeal = /\bdeal|deals|doing|does\b/.test(lower);

      if (!wantsResistance && !wantsImmunity && !wantsVulnerability && !wantsDeal) {
        lines.push(
          `Derived monster facet for ${relationship.name}: ${relationship.monsters.resistanceIndexes.length} resistant, ${relationship.monsters.immunityIndexes.length} immune, ${relationship.monsters.vulnerabilityIndexes.length} vulnerable, ${relationship.monsters.dealsDamageIndexes.length} that deal it.`,
        );
      }
      if (wantsResistance) {
        lines.push(
          `${relationship.name} resistant monsters in SRD: ${relationship.monsters.resistanceIndexes.length}. Examples: ${summarizeNames(
            relationship.monsters.resistanceIndexes.map((index) =>
              (srdData.monsters || []).find((monster: any) => monster.index === index)?.name || index,
            ),
          )}.`,
        );
      }
      if (wantsImmunity) {
        lines.push(
          `${relationship.name} immune monsters in SRD: ${relationship.monsters.immunityIndexes.length}. Examples: ${summarizeNames(
            relationship.monsters.immunityIndexes.map((index) =>
              (srdData.monsters || []).find((monster: any) => monster.index === index)?.name || index,
            ),
          )}.`,
        );
      }
      if (wantsVulnerability) {
        lines.push(
          `${relationship.name} vulnerable monsters in SRD: ${relationship.monsters.vulnerabilityIndexes.length}. Examples: ${summarizeNames(
            relationship.monsters.vulnerabilityIndexes.map((index) =>
              (srdData.monsters || []).find((monster: any) => monster.index === index)?.name || index,
            ),
          )}.`,
        );
      }
      if (wantsDeal) {
        lines.push(
          `Monsters that deal ${relationship.name} damage in SRD: ${relationship.monsters.dealsDamageIndexes.length}. Examples: ${summarizeNames(
            relationship.monsters.dealsDamageIndexes.map((index) =>
              (srdData.monsters || []).find((monster: any) => monster.index === index)?.name || index,
            ),
          )}.`,
        );
      }
      lines.push(`Relevant page: /dnd/5e/srd/damage-types/${damageTypeIndex}`);
    }
  }

  if (
    abilityIndex &&
    /\bspellcasting\b/.test(lower) &&
    /\bclass|classes|caster|casters|spellcaster|spellcasters\b/.test(lower)
  ) {
    const classes = getClassesForSpellcastingAbility(abilityIndex);
    if (classes.length) {
      const abilityLabel = abilityIndex.toUpperCase();
      lines.push(
        `Derived class facet: ${abilityLabel} spellcasting classes in SRD: ${classes.length}. ${summarizeNames(
          classes.map((item: any) => item?.name),
        )}.`,
      );
    }
  }

  if (!lines.length) return null;
  return lines.join("\n");
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

      const schoolExamples = getSpellSchoolOptionsForClass(context.index)
        .slice(0, 6)
        .map((item) => `${item.label} (${item.count})`)
        .join(", ");
      if (schoolExamples) {
        lines.push(`Common spell schools for ${classLabel}: ${schoolExamples}.`);
      }

      const damageExamples = getSpellDamageTypeOptionsForClass(context.index)
        .slice(0, 6)
        .map((item) => `${item.label} (${item.count})`)
        .join(", ");
      if (damageExamples) {
        lines.push(`Common spell damage types for ${classLabel}: ${damageExamples}.`);
      }
    } else {
      lines.push(`Class spell list for ${classLabel}: none in the SRD base class spell list.`);
    }

    const spellcastingAbilityIndex = String(
      focusedEntry?.spellcasting?.spellcasting_ability?.index || "",
    )
      .trim()
      .toLowerCase();
    if (spellcastingAbilityIndex) {
      const siblingCasters = getClassesForSpellcastingAbility(spellcastingAbilityIndex)
        .map((item: any) => item?.name)
        .filter(Boolean)
        .filter((name: string) => name.toLowerCase() !== String(classLabel).toLowerCase());
      if (siblingCasters.length) {
        lines.push(
          `Other ${spellcastingAbilityIndex.toUpperCase()} spellcasting classes: ${summarizeNames(
            siblingCasters,
          )}.`,
        );
      }
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

    const damageTypeIndex = String(focusedEntry?.damage?.damage_type?.index || "")
      .trim()
      .toLowerCase();
    if (damageTypeIndex) {
      lines.push(`Related spell damage filter page: /dnd/5e/srd/spells/damage/${damageTypeIndex}`);
      lines.push(`Related damage type hub page: /dnd/5e/srd/damage-types/${damageTypeIndex}`);
    }
  }

  if (context.category === "monsters" && context.index && focusedEntry) {
    const typeSlug = toMonsterTypeSlug(String(focusedEntry?.type || ""));
    if (typeSlug) {
      lines.push(`Related monster type page: /dnd/5e/srd/monsters/type/${typeSlug}`);
    }

    const challengeRating = String(focusedEntry?.challenge_rating ?? "").trim();
    if (challengeRating) {
      lines.push(`Related monster CR page: /dnd/5e/srd/monsters/cr/${toCrSlug(challengeRating)}`);
    }

    const conditionImmunities = (focusedEntry?.condition_immunities || [])
      .map((condition: any) => ({
        index: String(condition?.index || "").trim().toLowerCase(),
        name: String(condition?.name || condition?.index || "").trim(),
      }))
      .filter((condition: { index: string; name: string }) => condition.index && condition.name);
    if (conditionImmunities.length) {
      lines.push(
        `Monster condition immunities: ${conditionImmunities
          .map((condition: { name: string }) => condition.name)
          .join(", ")}.`,
      );
      lines.push(
        `Related condition immunity pages: ${conditionImmunities
          .map(
            (condition: { index: string }) =>
              `/dnd/5e/srd/monsters/condition-immunity/${condition.index}`,
          )
          .join(", ")}.`,
      );
    }

    const relatedDamageTypes = getRelatedDamageTypesForMonster(focusedEntry);
    if (relatedDamageTypes.length) {
      lines.push(
        `Related damage type pages: ${relatedDamageTypes
          .map((damageType) => `/dnd/5e/srd/damage-types/${damageType.index}`)
          .join(", ")}.`,
      );
    }
  }

  if (context.category === "damage-types" && context.index) {
    const relationship = getDamageTypeRelationship(context.index);
    if (relationship) {
      lines.push(
        `Damage type relationships: ${relationship.spells.indexes.length} spells, ${relationship.monsters.dealsDamageIndexes.length} monsters dealing it, ${relationship.monsters.resistanceIndexes.length} resistant, ${relationship.monsters.immunityIndexes.length} immune, ${relationship.monsters.vulnerabilityIndexes.length} vulnerable.`,
      );
      const spellExamples = summarizeNames(
        relationship.spells.indexes.map((index) =>
          (srdData.spells || []).find((spell: any) => spell.index === index)?.name || index,
        ),
      );
      if (spellExamples) lines.push(`Damage type spell examples: ${spellExamples}.`);
      const monsterExamples = summarizeNames(
        relationship.monsters.immunityIndexes.map((index) =>
          (srdData.monsters || []).find((monster: any) => monster.index === index)?.name || index,
        ),
      );
      if (monsterExamples) lines.push(`Damage type immunity examples: ${monsterExamples}.`);
      lines.push(`Related spell filter page: /dnd/5e/srd/spells/damage/${context.index}`);
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
      `- Detail page patterns: spells → /dnd/5e/srd/spells/{index}, monsters → /dnd/5e/srd/monsters/{index}, equipment → /dnd/5e/srd/equipment/{index}, magic items → /dnd/5e/srd/magic-items/{index}, classes → /dnd/5e/srd/classes/{index}, races → /dnd/5e/srd/races/{index}, backgrounds → /dnd/5e/srd/backgrounds/{index}, damage types → /dnd/5e/srd/damage-types/{index}, features → /dnd/5e/srd/features/{index}\n` +
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

const CACHE_PREFIX = "srd-search:v2:";
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
  "damage-types": "/dnd/5e/srd/damage-types/",
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
  const spellDamageTypes = new Set<string>();
  const monsterTypes = new Set<string>();
  const monsterCrs = new Set<string>();
  const monsterConditionImmunities = new Set<string>();

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
    if (spell?.damage?.damage_type?.index) {
      spellDamageTypes.add(String(spell.damage.damage_type.index));
    }
  }

  for (const monster of srdData.monsters || []) {
    if (monster?.type) {
      monsterTypes.add(toMonsterTypeSlug(monster.type));
    }
    if (monster?.challenge_rating !== undefined && monster?.challenge_rating !== null) {
      monsterCrs.add(toCrSlug(String(monster.challenge_rating)));
    }
    for (const condition of monster?.condition_immunities || []) {
      if (condition?.index) {
        monsterConditionImmunities.add(String(condition.index).toLowerCase());
      }
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
  for (const damageType of spellDamageTypes) {
    paths.add(`/dnd/5e/srd/spells/damage/${damageType}`);
  }
  for (const typeSlug of monsterTypes) {
    paths.add(`/dnd/5e/srd/monsters/type/${typeSlug}`);
  }
  for (const crSlug of monsterCrs) {
    paths.add(`/dnd/5e/srd/monsters/cr/${crSlug}`);
  }
  for (const conditionIndex of monsterConditionImmunities) {
    paths.add(`/dnd/5e/srd/monsters/condition-immunity/${conditionIndex}`);
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
  const spellDamageTypeIndexes = Array.from(
    new Set(
      (srdData.spells || [])
        .map((s) => s?.damage?.damage_type?.index)
        .filter(Boolean),
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
  const monsterConditionImmunityIndexes = Array.from(
    new Set(
      (srdData.monsters || []).flatMap((monster) =>
        (monster?.condition_immunities || [])
          .map((condition: any) => condition?.index)
          .filter(Boolean),
      ),
    ),
  ).sort();

  srdLinkReferenceCache = [
    "- Core indexes: /dnd/5e/srd/contents, /dnd/5e/srd/spells, /dnd/5e/srd/monsters, /dnd/5e/srd/equipment, /dnd/5e/srd/classes, /dnd/5e/srd/races, /dnd/5e/srd/backgrounds",
    "- Damage type detail pattern: /dnd/5e/srd/damage-types/{index}",
    "- Feature detail pattern: /dnd/5e/srd/features/{index}",
    "- Spell filter pattern: /dnd/5e/srd/spells/level/{0-9}",
    `- Spell school filter pattern: /dnd/5e/srd/spells/school/{index} where index in [${spellSchoolIndexes.join(", ")}]`,
    `- Spell class filter pattern: /dnd/5e/srd/spells/class/{index} where index in [${spellClassIndexes.join(", ")}]`,
    `- Spell damage filter pattern: /dnd/5e/srd/spells/damage/{index} where index in [${spellDamageTypeIndexes.join(", ")}]`,
    `- Monster type filter pattern: /dnd/5e/srd/monsters/type/{slug} where slug in [${monsterTypeSlugs.join(", ")}]`,
    `- Monster CR filter pattern: /dnd/5e/srd/monsters/cr/{slug} where slug in [${monsterCrSlugs.join(", ")}]`,
    `- Monster condition immunity filter pattern: /dnd/5e/srd/monsters/condition-immunity/{index} where index in [${monsterConditionImmunityIndexes.join(", ")}]`,
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

function countMarkdownLinks(markdown: string): number {
  return (markdown.match(/\[[^\]]+\]\(([^)]+)\)/g) || []).length;
}

function buildDerivedAnswerLinkSupplement(
  query: string,
  context: NormalizedSearchContext | null,
): string | null {
  const monsterFacetMatch = resolveMonsterFacetMatch(query, context);
  if (monsterFacetMatch && monsterFacetMatch.monsters.length) {
    const filterLinks: string[] = [];
    if (monsterFacetMatch.monsterTypeFacetIndex) {
      filterLinks.push(
        `[${monsterFacetMatch.typeLabel || "Monster Type"}](/dnd/5e/srd/monsters/type/${monsterFacetMatch.monsterTypeFacetIndex})`,
      );
    }
    if (monsterFacetMatch.monsterConditionImmunityFacetIndex) {
      filterLinks.push(
        `[${monsterFacetMatch.conditionLabel || "Condition Immunity"}](/dnd/5e/srd/monsters/condition-immunity/${monsterFacetMatch.monsterConditionImmunityFacetIndex})`,
      );
    }

    const monsterLinks = monsterFacetMatch.monsters
      .slice(0, 8)
      .map((monster: any) => {
        const index = String(monster?.index || "").trim().toLowerCase();
        const name = String(monster?.name || index).trim();
        if (!index || !name) return null;
        return `[${name}](/dnd/5e/srd/monsters/${index})`;
      })
      .filter((value): value is string => Boolean(value));

    const allLinks = [...filterLinks, ...monsterLinks];
    if (!allLinks.length) return null;

    return `Related pages: ${allLinks.join(", ")}.`;
  }

  const spellFacetMatch = resolveSpellFacetMatch(query, context);
  if (!spellFacetMatch || !spellFacetMatch.spells.length) return null;

  const filterLinks: string[] = [];
  if (spellFacetMatch.classIndex) {
    filterLinks.push(
      `[${spellFacetMatch.classLabel || "Class"} Spells](/dnd/5e/srd/spells/class/${spellFacetMatch.classIndex})`,
    );
  }
  if (spellFacetMatch.damageTypeIndex) {
    filterLinks.push(
      `[${spellFacetMatch.damageTypeName || "Damage Type"} Damage Spells](/dnd/5e/srd/spells/damage/${spellFacetMatch.damageTypeIndex})`,
    );
  }

  const spellLinks = spellFacetMatch.spells
    .slice(0, 8)
    .map((spell: any) => {
      const index = String(spell?.index || "").trim().toLowerCase();
      const name = String(spell?.name || index).trim();
      if (!index || !name) return null;
      return `[${name}](/dnd/5e/srd/spells/${index})`;
    })
    .filter((value): value is string => Boolean(value));

  const allLinks = [...filterLinks, ...spellLinks];
  if (!allLinks.length) return null;

  return `Related pages: ${allLinks.join(", ")}.`;
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
  const rawContext = findRelevantEntries(query, categories, {
    context: normalizedContext || undefined,
  });
  const derivedContext = buildDerivedQueryContext(query, normalizedContext);
  const context = [derivedContext, rawContext].filter(Boolean).join("\n\n");

  if (!context) {
    return "I couldn't find any relevant SRD data for that query. Try asking about specific spells, monsters, equipment, conditions, or other D&D 5E rules.";
  }

  const pageContext = buildPageContextBlock(normalizedContext);

  // Query Mistral; short mode skips auto-linking (plain text for Discord).
  const raw = await queryMistral(query, context, short, pageContext);
  let answer = short ? raw : stripInvalidLinks(addDeterministicLinks(raw));
  if (!short && countMarkdownLinks(answer) === 0) {
    const supplement = buildDerivedAnswerLinkSupplement(query, normalizedContext);
    if (supplement) {
      answer = `${answer.trim()}\n\n${supplement}`;
    }
  }

  // Cache the result
  await setCache(query, answer, short, normalizedContext);

  return answer;
}
