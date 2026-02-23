// ── Compact serializers ───────────────────────────────────────────────────────

function serializeSpell(s: any): string {
  const classes = (s.classes || []).map((c: any) => c.name).join(", ");
  const subclasses = (s.subclasses || []).map((c: any) => c.name).join(", ");
  const school = s.school?.name || "";
  const desc = Array.isArray(s.desc) ? s.desc.join(" ") : s.desc || "";
  const higherLevel = Array.isArray(s.higher_level) ? s.higher_level.join(" ") : "";
  const dmgType = s.damage?.damage_type?.name || "";
  const dmgAtSlot = s.damage?.damage_at_slot_level;
  const dmgSlotStr = dmgAtSlot
    ? Object.entries(dmgAtSlot).map(([lvl, dice]) => `Lv${lvl}: ${dice}`).join(", ")
    : "";
  const components = (s.components || []).join(", ");
  const materialStr = s.material ? ` (${s.material})` : "";
  return (
    `SPELL: ${s.name} [index: ${s.index}] (Level ${s.level}, ${school})` +
    `\nRange: ${s.range || "?"} | Components: ${components}${materialStr} | Duration: ${s.duration || "?"}` +
    `\nCasting Time: ${s.casting_time || "?"} | Concentration: ${s.concentration ? "Yes" : "No"} | Ritual: ${s.ritual ? "Yes" : "No"}` +
    (s.attack_type ? `\nAttack Type: ${s.attack_type}` : "") +
    (classes ? `\nClasses: ${classes}` : "") +
    (subclasses ? `\nSubclasses: ${subclasses}` : "") +
    (dmgType ? `\nDamage Type: ${dmgType}` : "") +
    (dmgSlotStr ? `\nDamage by Slot: ${dmgSlotStr}` : "") +
    `\n${desc.slice(0, 500)}` +
    (higherLevel ? `\nAt Higher Levels: ${higherLevel.slice(0, 200)}` : "")
  );
}

function serializeMonster(m: any): string {
  const ac = Array.isArray(m.armor_class)
    ? m.armor_class.map((a: any) => a.value).join("/")
    : m.armor_class || "?";

  // Speed
  const speedParts: string[] = [];
  if (m.speed) {
    for (const [mode, val] of Object.entries(m.speed)) {
      speedParts.push(`${mode} ${val}`);
    }
  }

  // Senses
  const sensesParts: string[] = [];
  if (m.senses) {
    for (const [sense, val] of Object.entries(m.senses)) {
      if (val) sensesParts.push(`${sense.replace(/_/g, " ")} ${val}`);
    }
  }

  // Immunities & resistances
  const dmgImmunities = (m.damage_immunities || []).join(", ");
  const dmgResistances = (m.damage_resistances || []).join(", ");
  const condImmunities = (m.condition_immunities || []).map((c: any) => c.name || c).join(", ");

  const formatAbilities = (list: any[], limit: number) =>
    (list || [])
      .slice(0, limit)
      .map((a: any) => {
        const d = Array.isArray(a.desc) ? a.desc.join(" ") : a.desc || "";
        return `  - ${a.name}: ${d.slice(0, 200)}`;
      })
      .join("\n");

  const specials = formatAbilities(m.special_abilities, 4);
  const actions = formatAbilities(m.actions, 5);
  const legendary = formatAbilities(m.legendary_actions, 4);

  return (
    `MONSTER: ${m.name} [index: ${m.index}] (${m.size} ${m.type}, ${m.alignment || "unaligned"})` +
    `\nAC: ${ac} | HP: ${m.hit_points || "?"} (${m.hit_dice || "?"}) | CR: ${m.challenge_rating ?? "?"} | XP: ${m.xp ?? "?"}` +
    `\nSTR ${m.strength} DEX ${m.dexterity} CON ${m.constitution} INT ${m.intelligence} WIS ${m.wisdom} CHA ${m.charisma}` +
    (speedParts.length ? `\nSpeed: ${speedParts.join(", ")}` : "") +
    (sensesParts.length ? `\nSenses: ${sensesParts.join(", ")}` : "") +
    (m.languages ? `\nLanguages: ${m.languages}` : "") +
    (dmgImmunities ? `\nDamage Immunities: ${dmgImmunities}` : "") +
    (dmgResistances ? `\nDamage Resistances: ${dmgResistances}` : "") +
    (condImmunities ? `\nCondition Immunities: ${condImmunities}` : "") +
    (specials ? `\nSpecial Abilities:\n${specials}` : "") +
    (actions ? `\nActions:\n${actions}` : "") +
    (legendary ? `\nLegendary Actions:\n${legendary}` : "")
  );
}

function serializeEquipment(e: any): string {
  const cat = e.equipment_category?.name || "";
  const cost = e.cost ? `${e.cost.quantity} ${e.cost.unit}` : "";
  const dmg = e.damage ? `${e.damage.damage_dice} ${e.damage.damage_type?.name || ""}` : "";
  const props = (e.properties || []).map((p: any) => p.name).join(", ");
  const desc = Array.isArray(e.desc) ? e.desc.join(" ") : "";
  const contents = Array.isArray(e.contents) && e.contents.length
    ? e.contents.map((c: any) => `${c.item?.name || "?"} [index: ${c.item?.index || "?"}] x${c.quantity}`).join(", ")
    : "";
  return (
    `EQUIPMENT: ${e.name} [index: ${e.index}] (${cat})` +
    (cost ? ` | Cost: ${cost}` : "") +
    (e.weight ? ` | Weight: ${e.weight} lb` : "") +
    (dmg ? `\nDamage: ${dmg}` : "") +
    (props ? `\nProperties: ${props}` : "") +
    (contents ? `\nContents: ${contents}` : "") +
    (desc ? `\n${desc.slice(0, 300)}` : "")
  );
}

function serializeMagicItem(m: any): string {
  const rarity = m.rarity?.name || "";
  const desc = Array.isArray(m.desc) ? m.desc.join(" ") : "";
  return (
    `MAGIC ITEM: ${m.name} [index: ${m.index}] (${rarity})` +
    `\n${desc.slice(0, 400)}`
  );
}

export function serializeGeneric(entry: any, label: string): string {
  const desc = Array.isArray(entry.desc) ? entry.desc.join(" ") : entry.desc || "";
  const extra: string[] = [];
  const index = entry.index ? ` [index: ${entry.index}]` : "";
  if (entry.class?.name) extra.push(`Class: ${entry.class.name}`);
  if (entry.level !== undefined) extra.push(`Level: ${entry.level}`);
  return (
    `${label}: ${entry.name}${index}` +
    (extra.length ? ` (${extra.join(", ")})` : "") +
    `\n${desc.slice(0, 400)}`
  );
}

function serializeRace(r: any): string {
  const bonuses = (r.ability_bonuses || [])
    .map((b: any) => `${b.ability_score?.name || "?"} +${b.bonus}`)
    .join(", ");
  const traits = (r.traits || []).map((t: any) => t.name).join(", ");
  const langs = (r.languages || []).map((l: any) => l.name).join(", ");
  return (
    `RACE: ${r.name} [index: ${r.index}] (Size: ${r.size || "?"}, Speed: ${r.speed || "?"} ft)` +
    (bonuses ? `\nAbility Bonuses: ${bonuses}` : "") +
    (traits ? `\nTraits: ${traits}` : "") +
    (langs ? `\nLanguages: ${langs}` : "") +
    (r.age ? `\nAge: ${r.age}` : "") +
    (r.alignment ? `\nAlignment: ${r.alignment}` : "")
  );
}

function serializeSubclass(s: any): string {
  const desc = Array.isArray(s.desc) ? s.desc.join(" ") : s.desc || "";
  return (
    `SUBCLASS: ${s.name} [index: ${s.index}] (${s.subclass_flavor || ""}, ${s.class?.name || ""})` +
    `\n${desc.slice(0, 500)}`
  );
}

function serializeRuleSection(r: any): string {
  const desc = typeof r.desc === "string" ? r.desc : "";
  return (
    `RULE: ${r.name}` +
    `\n${desc.slice(0, 1500)}`
  );
}

export const SERIALIZERS: Record<string, (entry: any) => string> = {
  spells: serializeSpell,
  monsters: serializeMonster,
  equipment: serializeEquipment,
  "magic-items": serializeMagicItem,
  races: serializeRace,
  subclasses: serializeSubclass,
  subraces: (e) => {
    const desc = typeof e.desc === "string" ? e.desc : "";
    const traits = (e.racial_traits || []).map((t: any) => t.name).join(", ");
    return (
      `SUBRACE: ${e.name} [index: ${e.index}] (${e.race?.name || ""})` +
      (desc ? `\n${desc}` : "") +
      (traits ? `\nRacial Traits: ${traits}` : "")
    );
  },
  "rule-sections": serializeRuleSection,
  rules: (e) => {
    const subs = (e.subsections || []).map((s: any) => s.name).join(", ");
    return `RULE CATEGORY: ${e.name}` + (subs ? `\nSections: ${subs}` : "");
  },
  levels: (e) => {
    const feats = (e.features || []).map((f: any) => f.name).join(", ");
    return (
      `LEVEL: ${e.class?.name || "?"} Level ${e.level}` +
      `\nProf Bonus: +${e.prof_bonus || "?"}` +
      (feats ? `\nFeatures: ${feats}` : "")
    );
  },
  proficiencies: (e) => serializeGeneric(e, "PROFICIENCY"),
  classes: (e) => serializeGeneric(e, "CLASS"),
  conditions: (e) => serializeGeneric(e, "CONDITION"),
  "damage-types": (e) => serializeGeneric(e, "DAMAGE TYPE"),
  features: (e) => serializeGeneric(e, "FEATURE"),
  feats: (e) => serializeGeneric(e, "FEAT"),
  skills: (e) => serializeGeneric(e, "SKILL"),
  "ability-scores": (e) => serializeGeneric(e, "ABILITY SCORE"),
  alignments: (e) => serializeGeneric(e, "ALIGNMENT"),
  backgrounds: (e) => serializeGeneric(e, "BACKGROUND"),
  languages: (e) => serializeGeneric(e, "LANGUAGE"),
  traits: (e) => serializeGeneric(e, "TRAIT"),
  "weapon-properties": (e) => serializeGeneric(e, "WEAPON PROPERTY"),
  "magic-schools": (e) => serializeGeneric(e, "MAGIC SCHOOL"),
  "equipment-categories": (e) => serializeGeneric(e, "EQUIPMENT CATEGORY"),
};
