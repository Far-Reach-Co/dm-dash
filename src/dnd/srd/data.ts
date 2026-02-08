import path = require("path");
import fs = require("fs");

// ── Load all SRD JSON at startup ──────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, "../../../public/lib/data/2014");

const SRD_FILES: Record<string, string> = {
  spells: "5e-srd-spells.json",
  monsters: "5e-srd-monsters.json",
  equipment: "5e-srd-equipment.json",
  "magic-items": "5e-srd-magic-items.json",
  classes: "5e-srd-classes.json",
  conditions: "5e-srd-conditions.json",
  "damage-types": "5e-srd-damage-types.json",
  features: "5e-srd-features.json",
  feats: "5e-srd-feats.json",
  skills: "5e-srd-skills.json",
  "ability-scores": "5e-srd-ability-scores.json",
  alignments: "5e-srd-alignments.json",
  backgrounds: "5e-srd-backgrounds.json",
  languages: "5e-srd-languages.json",
  levels: "5e-srd-levels.json",
  proficiencies: "5e-srd-proficiencies.json",
  races: "5e-srd-races.json",
  "rule-sections": "5e-srd-rule-sections.json",
  rules: "5e-srd-rules.json",
  subclasses: "5e-srd-subclasses.json",
  subraces: "5e-srd-subraces.json",
  traits: "5e-srd-traits.json",
  "weapon-properties": "5e-srd-weapon-properties.json",
  "magic-schools": "5e-srd-magic-schools.json",
  "equipment-categories": "5e-srd-equipment-categories.json",
};

export const srdData: Record<string, any[]> = {};
for (const [key, file] of Object.entries(SRD_FILES)) {
  try {
    srdData[key] = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, file), "utf8"),
    );
  } catch {
    srdData[key] = [];
  }
}

// ── Category detection ────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  spells: [
    "spell", "spells", "cantrip", "cantrips", "casting", "cast", "ritual",
    "concentration", "evocation", "abjuration", "conjuration", "divination",
    "enchantment", "illusion", "necromancy", "transmutation", "slot",
    "components", "verbal", "somatic", "material",
  ],
  monsters: [
    "monster", "monsters", "creature", "creatures", "beast", "beasts",
    "dragon", "dragons", "undead", "fiend", "fiends", "aberration",
    "celestial", "construct", "elemental", "fey", "giant", "humanoid",
    "monstrosity", "ooze", "plant", "ac", "armor class", "hit points",
    "hp", "cr", "challenge rating", "legendary",
  ],
  equipment: [
    "equipment", "weapon", "weapons", "armor", "shield", "sword",
    "bow", "axe", "dagger", "mace", "staff", "tool", "tools", "pack",
    "gear", "cost", "weight", "melee", "ranged",
  ],
  "magic-items": [
    "magic item", "magic items", "magical", "wondrous", "potion",
    "potions", "scroll", "scrolls", "wand", "rod", "ring", "artifact",
    "attunement", "rarity", "uncommon", "rare", "very rare", "legendary item",
  ],
  classes: [
    "class", "classes", "barbarian", "bard", "cleric", "druid", "fighter",
    "monk", "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard",
    "hit die", "subclass", "proficiency", "multiclass",
  ],
  conditions: [
    "condition", "conditions", "blinded", "charmed", "deafened",
    "frightened", "grappled", "incapacitated", "invisible", "paralyzed",
    "petrified", "poisoned", "prone", "restrained", "stunned",
    "unconscious", "exhaustion",
  ],
  "damage-types": [
    "damage type", "damage types", "fire", "cold", "lightning", "thunder",
    "acid", "poison", "necrotic", "radiant", "force", "psychic",
    "bludgeoning", "piercing", "slashing",
  ],
  features: [
    "feature", "features", "ability", "rage", "sneak attack",
    "wild shape", "channel divinity", "extra attack",
  ],
  feats: ["feat", "feats", "grappler"],
  skills: [
    "skill", "skills", "athletics", "acrobatics", "stealth",
    "arcana", "history", "investigation", "nature", "religion",
    "perception", "insight", "medicine", "survival", "persuasion",
    "deception", "intimidation", "performance", "animal handling",
    "sleight of hand",
  ],
  "ability-scores": [
    "ability score", "ability scores", "strength", "dexterity",
    "constitution", "intelligence", "wisdom", "charisma",
    "str", "dex", "con", "int", "wis", "cha", "modifier",
  ],
  races: [
    "race", "races", "dwarf", "elf", "halfling", "human", "dragonborn",
    "gnome", "half-elf", "half-orc", "tiefling", "subrace", "subraces",
    "racial", "speed", "ability bonus",
  ],
  subclasses: [
    "subclass", "subclasses", "path", "domain", "college", "circle",
    "archetype", "tradition", "oath", "patron", "origin", "berserker",
    "lore", "life", "land", "champion", "open hand", "devotion",
    "hunter", "thief", "draconic", "fiend", "evocation",
  ],
  subraces: [
    "subrace", "subraces", "hill dwarf", "high elf", "lightfoot",
    "rock gnome",
  ],
  "rule-sections": [
    "rule", "rules", "combat", "initiative", "action", "actions",
    "attack", "attacks", "movement", "cover", "damage", "healing",
    "rest", "resting", "short rest", "long rest", "dying", "death",
    "saving throw", "saving throws", "ability check", "ability checks",
    "advantage", "disadvantage", "spellcasting", "opportunity attack",
    "grapple", "grappling", "shove", "prone", "surprise", "reaction",
    "bonus action", "dash", "dodge", "disengage", "hide", "ready",
    "between adventures", "time", "adventuring", "environment",
  ],
  levels: [
    "level", "levels", "proficiency bonus", "level up", "class level",
  ],
  proficiencies: [
    "proficiency", "proficiencies", "proficient", "saving throw",
    "armor proficiency", "weapon proficiency",
  ],
  languages: ["language", "languages", "common", "elvish", "dwarvish"],
  traits: ["trait", "traits", "darkvision", "racial"],
  "weapon-properties": [
    "weapon property", "weapon properties", "finesse", "heavy", "light",
    "loading", "reach", "thrown", "two-handed", "versatile", "ammunition",
  ],
};

export function detectCategories(query: string): string[] {
  const lower = query.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > 0) scores[category] = score;
  }

  // Sort by score descending, take top 3
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  // Default to common categories if nothing matched
  if (sorted.length === 0) {
    return ["spells", "monsters", "equipment", "conditions", "rule-sections"];
  }

  return sorted;
}
