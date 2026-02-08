"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERIALIZERS = void 0;
exports.serializeGeneric = serializeGeneric;
function serializeSpell(s) {
    var _a, _b, _c, _d;
    const classes = (s.classes || []).map((c) => c.name).join(", ");
    const subclasses = (s.subclasses || []).map((c) => c.name).join(", ");
    const school = ((_a = s.school) === null || _a === void 0 ? void 0 : _a.name) || "";
    const desc = Array.isArray(s.desc) ? s.desc.join(" ") : s.desc || "";
    const higherLevel = Array.isArray(s.higher_level) ? s.higher_level.join(" ") : "";
    const dmgType = ((_c = (_b = s.damage) === null || _b === void 0 ? void 0 : _b.damage_type) === null || _c === void 0 ? void 0 : _c.name) || "";
    const dmgAtSlot = (_d = s.damage) === null || _d === void 0 ? void 0 : _d.damage_at_slot_level;
    const dmgSlotStr = dmgAtSlot
        ? Object.entries(dmgAtSlot).map(([lvl, dice]) => `Lv${lvl}: ${dice}`).join(", ")
        : "";
    const components = (s.components || []).join(", ");
    const materialStr = s.material ? ` (${s.material})` : "";
    return (`SPELL: ${s.name} [index: ${s.index}] (Level ${s.level}, ${school})` +
        `\nRange: ${s.range || "?"} | Components: ${components}${materialStr} | Duration: ${s.duration || "?"}` +
        `\nCasting Time: ${s.casting_time || "?"} | Concentration: ${s.concentration ? "Yes" : "No"} | Ritual: ${s.ritual ? "Yes" : "No"}` +
        (s.attack_type ? `\nAttack Type: ${s.attack_type}` : "") +
        (classes ? `\nClasses: ${classes}` : "") +
        (subclasses ? `\nSubclasses: ${subclasses}` : "") +
        (dmgType ? `\nDamage Type: ${dmgType}` : "") +
        (dmgSlotStr ? `\nDamage by Slot: ${dmgSlotStr}` : "") +
        `\n${desc.slice(0, 500)}` +
        (higherLevel ? `\nAt Higher Levels: ${higherLevel.slice(0, 200)}` : ""));
}
function serializeMonster(m) {
    var _a, _b;
    const ac = Array.isArray(m.armor_class)
        ? m.armor_class.map((a) => a.value).join("/")
        : m.armor_class || "?";
    const speedParts = [];
    if (m.speed) {
        for (const [mode, val] of Object.entries(m.speed)) {
            speedParts.push(`${mode} ${val}`);
        }
    }
    const sensesParts = [];
    if (m.senses) {
        for (const [sense, val] of Object.entries(m.senses)) {
            if (val)
                sensesParts.push(`${sense.replace(/_/g, " ")} ${val}`);
        }
    }
    const dmgImmunities = (m.damage_immunities || []).join(", ");
    const dmgResistances = (m.damage_resistances || []).join(", ");
    const condImmunities = (m.condition_immunities || []).map((c) => c.name || c).join(", ");
    const formatAbilities = (list, limit) => (list || [])
        .slice(0, limit)
        .map((a) => {
        const d = Array.isArray(a.desc) ? a.desc.join(" ") : a.desc || "";
        return `  - ${a.name}: ${d.slice(0, 200)}`;
    })
        .join("\n");
    const specials = formatAbilities(m.special_abilities, 4);
    const actions = formatAbilities(m.actions, 5);
    const legendary = formatAbilities(m.legendary_actions, 4);
    return (`MONSTER: ${m.name} [index: ${m.index}] (${m.size} ${m.type}, ${m.alignment || "unaligned"})` +
        `\nAC: ${ac} | HP: ${m.hit_points || "?"} (${m.hit_dice || "?"}) | CR: ${(_a = m.challenge_rating) !== null && _a !== void 0 ? _a : "?"} | XP: ${(_b = m.xp) !== null && _b !== void 0 ? _b : "?"}` +
        `\nSTR ${m.strength} DEX ${m.dexterity} CON ${m.constitution} INT ${m.intelligence} WIS ${m.wisdom} CHA ${m.charisma}` +
        (speedParts.length ? `\nSpeed: ${speedParts.join(", ")}` : "") +
        (sensesParts.length ? `\nSenses: ${sensesParts.join(", ")}` : "") +
        (m.languages ? `\nLanguages: ${m.languages}` : "") +
        (dmgImmunities ? `\nDamage Immunities: ${dmgImmunities}` : "") +
        (dmgResistances ? `\nDamage Resistances: ${dmgResistances}` : "") +
        (condImmunities ? `\nCondition Immunities: ${condImmunities}` : "") +
        (specials ? `\nSpecial Abilities:\n${specials}` : "") +
        (actions ? `\nActions:\n${actions}` : "") +
        (legendary ? `\nLegendary Actions:\n${legendary}` : ""));
}
function serializeEquipment(e) {
    var _a, _b;
    const cat = ((_a = e.equipment_category) === null || _a === void 0 ? void 0 : _a.name) || "";
    const cost = e.cost ? `${e.cost.quantity} ${e.cost.unit}` : "";
    const dmg = e.damage ? `${e.damage.damage_dice} ${((_b = e.damage.damage_type) === null || _b === void 0 ? void 0 : _b.name) || ""}` : "";
    const props = (e.properties || []).map((p) => p.name).join(", ");
    const desc = Array.isArray(e.desc) ? e.desc.join(" ") : "";
    const contents = Array.isArray(e.contents) && e.contents.length
        ? e.contents.map((c) => { var _a, _b; return `${((_a = c.item) === null || _a === void 0 ? void 0 : _a.name) || "?"} [index: ${((_b = c.item) === null || _b === void 0 ? void 0 : _b.index) || "?"}] x${c.quantity}`; }).join(", ")
        : "";
    return (`EQUIPMENT: ${e.name} [index: ${e.index}] (${cat})` +
        (cost ? ` | Cost: ${cost}` : "") +
        (e.weight ? ` | Weight: ${e.weight} lb` : "") +
        (dmg ? `\nDamage: ${dmg}` : "") +
        (props ? `\nProperties: ${props}` : "") +
        (contents ? `\nContents: ${contents}` : "") +
        (desc ? `\n${desc.slice(0, 300)}` : ""));
}
function serializeMagicItem(m) {
    var _a;
    const rarity = ((_a = m.rarity) === null || _a === void 0 ? void 0 : _a.name) || "";
    const desc = Array.isArray(m.desc) ? m.desc.join(" ") : "";
    return (`MAGIC ITEM: ${m.name} [index: ${m.index}] (${rarity})` +
        `\n${desc.slice(0, 400)}`);
}
function serializeGeneric(entry, label) {
    var _a;
    const desc = Array.isArray(entry.desc) ? entry.desc.join(" ") : entry.desc || "";
    const extra = [];
    if ((_a = entry.class) === null || _a === void 0 ? void 0 : _a.name)
        extra.push(`Class: ${entry.class.name}`);
    if (entry.level !== undefined)
        extra.push(`Level: ${entry.level}`);
    return (`${label}: ${entry.name}` +
        (extra.length ? ` (${extra.join(", ")})` : "") +
        `\n${desc.slice(0, 400)}`);
}
function serializeRace(r) {
    const bonuses = (r.ability_bonuses || [])
        .map((b) => { var _a; return `${((_a = b.ability_score) === null || _a === void 0 ? void 0 : _a.name) || "?"} +${b.bonus}`; })
        .join(", ");
    const traits = (r.traits || []).map((t) => t.name).join(", ");
    const langs = (r.languages || []).map((l) => l.name).join(", ");
    return (`RACE: ${r.name} (Size: ${r.size || "?"}, Speed: ${r.speed || "?"} ft)` +
        (bonuses ? `\nAbility Bonuses: ${bonuses}` : "") +
        (traits ? `\nTraits: ${traits}` : "") +
        (langs ? `\nLanguages: ${langs}` : "") +
        (r.age ? `\nAge: ${r.age}` : "") +
        (r.alignment ? `\nAlignment: ${r.alignment}` : ""));
}
function serializeSubclass(s) {
    var _a;
    const desc = Array.isArray(s.desc) ? s.desc.join(" ") : s.desc || "";
    return (`SUBCLASS: ${s.name} (${s.subclass_flavor || ""}, ${((_a = s.class) === null || _a === void 0 ? void 0 : _a.name) || ""})` +
        `\n${desc.slice(0, 500)}`);
}
function serializeRuleSection(r) {
    const desc = typeof r.desc === "string" ? r.desc : "";
    return (`RULE: ${r.name}` +
        `\n${desc.slice(0, 1500)}`);
}
exports.SERIALIZERS = {
    spells: serializeSpell,
    monsters: serializeMonster,
    equipment: serializeEquipment,
    "magic-items": serializeMagicItem,
    races: serializeRace,
    subclasses: serializeSubclass,
    subraces: (e) => {
        var _a;
        const desc = typeof e.desc === "string" ? e.desc : "";
        const traits = (e.racial_traits || []).map((t) => t.name).join(", ");
        return (`SUBRACE: ${e.name} (${((_a = e.race) === null || _a === void 0 ? void 0 : _a.name) || ""})` +
            (desc ? `\n${desc}` : "") +
            (traits ? `\nRacial Traits: ${traits}` : ""));
    },
    "rule-sections": serializeRuleSection,
    rules: (e) => {
        const subs = (e.subsections || []).map((s) => s.name).join(", ");
        return `RULE CATEGORY: ${e.name}` + (subs ? `\nSections: ${subs}` : "");
    },
    levels: (e) => {
        var _a;
        const feats = (e.features || []).map((f) => f.name).join(", ");
        return (`LEVEL: ${((_a = e.class) === null || _a === void 0 ? void 0 : _a.name) || "?"} Level ${e.level}` +
            `\nProf Bonus: +${e.prof_bonus || "?"}` +
            (feats ? `\nFeatures: ${feats}` : ""));
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
