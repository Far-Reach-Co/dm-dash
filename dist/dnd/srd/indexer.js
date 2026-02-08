"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRelevantEntries = findRelevantEntries;
const data_js_1 = require("./data.js");
const serializers_js_1 = require("./serializers.js");
function pushRefNames(parts, arr) {
    if (Array.isArray(arr) && arr.length) {
        parts.push(arr.map((r) => r.name || r.index || r).join(" "));
    }
}
function pushAbilityBlock(parts, list, label) {
    if (!Array.isArray(list) || !list.length)
        return;
    if (label)
        parts.push(label);
    for (const a of list) {
        if (a.name)
            parts.push(a.name);
        if (Array.isArray(a.desc))
            parts.push(a.desc.join(" "));
        else if (typeof a.desc === "string")
            parts.push(a.desc);
    }
}
function getEntryText(entry) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const name = entry.name || entry.index || "";
    const p = [];
    if (Array.isArray(entry.desc))
        p.push(entry.desc.join(" "));
    else if (typeof entry.desc === "string")
        p.push(entry.desc);
    if (entry.full_name)
        p.push(entry.full_name);
    if (entry.type)
        p.push(entry.type);
    if (entry.alignment)
        p.push(entry.alignment);
    if ((_a = entry.school) === null || _a === void 0 ? void 0 : _a.name)
        p.push(entry.school.name);
    if ((_c = (_b = entry.damage) === null || _b === void 0 ? void 0 : _b.damage_type) === null || _c === void 0 ? void 0 : _c.name)
        p.push(entry.damage.damage_type.name);
    if (entry.material)
        p.push(entry.material);
    if (entry.range)
        p.push(entry.range);
    if (entry.duration)
        p.push(entry.duration);
    if (entry.casting_time)
        p.push(entry.casting_time);
    if (entry.attack_type)
        p.push(entry.attack_type);
    if (Array.isArray(entry.components))
        p.push(entry.components.join(" "));
    if (Array.isArray(entry.higher_level))
        p.push(entry.higher_level.join(" "));
    if (entry.concentration)
        p.push("concentration");
    if (entry.ritual)
        p.push("ritual");
    pushRefNames(p, entry.classes);
    pushRefNames(p, entry.subclasses);
    if (entry.size)
        p.push(entry.size);
    if (entry.hit_dice)
        p.push(entry.hit_dice);
    if (entry.languages && typeof entry.languages === "string")
        p.push(entry.languages);
    if (entry.challenge_rating !== undefined)
        p.push(`cr ${entry.challenge_rating}`);
    if (entry.speed && typeof entry.speed === "object") {
        p.push(Object.entries(entry.speed).map(([m, v]) => `${m} ${v}`).join(" "));
    }
    if (entry.senses && typeof entry.senses === "object") {
        p.push(Object.entries(entry.senses).map(([k, v]) => `${k.replace(/_/g, " ")} ${v}`).join(" "));
    }
    if (Array.isArray(entry.proficiencies)) {
        for (const prof of entry.proficiencies) {
            if ((_d = prof.proficiency) === null || _d === void 0 ? void 0 : _d.name)
                p.push(prof.proficiency.name);
        }
    }
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
    pushAbilityBlock(p, entry.special_abilities);
    pushAbilityBlock(p, entry.actions);
    pushAbilityBlock(p, entry.legendary_actions, "legendary actions");
    if (entry.hit_die)
        p.push(`hit die d${entry.hit_die}`);
    pushRefNames(p, entry.saving_throws);
    pushRefNames(p, entry.subclasses);
    if ((_e = entry.class) === null || _e === void 0 ? void 0 : _e.name)
        p.push(entry.class.name);
    if (entry.subclass_flavor)
        p.push(entry.subclass_flavor);
    if (entry.speed && typeof entry.speed === "number")
        p.push(`speed ${entry.speed}`);
    if (Array.isArray(entry.ability_bonuses)) {
        for (const b of entry.ability_bonuses) {
            if ((_f = b.ability_score) === null || _f === void 0 ? void 0 : _f.name)
                p.push(b.ability_score.name);
        }
    }
    if (entry.age)
        p.push(entry.age);
    if (entry.size_description)
        p.push(entry.size_description);
    if (entry.language_desc)
        p.push(entry.language_desc);
    pushRefNames(p, entry.traits);
    pushRefNames(p, entry.subraces);
    pushRefNames(p, entry.racial_traits);
    if ((_g = entry.race) === null || _g === void 0 ? void 0 : _g.name)
        p.push(entry.race.name);
    if (Array.isArray(entry.languages)) {
        pushRefNames(p, entry.languages);
    }
    if ((_h = entry.equipment_category) === null || _h === void 0 ? void 0 : _h.name)
        p.push(entry.equipment_category.name);
    if (entry.weapon_category)
        p.push(entry.weapon_category);
    if (entry.weapon_range)
        p.push(entry.weapon_range);
    if (entry.category_range)
        p.push(entry.category_range);
    if (entry.cost)
        p.push(`${entry.cost.quantity} ${entry.cost.unit}`);
    pushRefNames(p, entry.properties);
    if ((_j = entry.rarity) === null || _j === void 0 ? void 0 : _j.name)
        p.push(entry.rarity.name);
    if (Array.isArray(entry.contents)) {
        for (const c of entry.contents) {
            if ((_k = c.item) === null || _k === void 0 ? void 0 : _k.name)
                p.push(c.item.name);
        }
    }
    if ((_l = entry.ability_score) === null || _l === void 0 ? void 0 : _l.name)
        p.push(entry.ability_score.name);
    if ((_m = entry.feature) === null || _m === void 0 ? void 0 : _m.name)
        p.push(entry.feature.name);
    pushRefNames(p, entry.starting_proficiencies);
    if (entry.level !== undefined)
        p.push(`level ${entry.level}`);
    if (Array.isArray(entry.prerequisites)) {
        for (const pre of entry.prerequisites) {
            if ((_o = pre.ability_score) === null || _o === void 0 ? void 0 : _o.name)
                p.push(pre.ability_score.name);
        }
    }
    if (entry.prof_bonus)
        p.push(`proficiency bonus +${entry.prof_bonus}`);
    pushRefNames(p, entry.features);
    pushRefNames(p, entry.races);
    if ((_p = entry.reference) === null || _p === void 0 ? void 0 : _p.name)
        p.push(entry.reference.name);
    pushRefNames(p, entry.races);
    pushRefNames(p, entry.subraces);
    if (Array.isArray(entry.subsections)) {
        p.push(entry.subsections.map((s) => s.name).join(" "));
    }
    if (entry.typical_speakers) {
        pushRefNames(p, entry.typical_speakers);
    }
    if (entry.script)
        p.push(entry.script);
    return { name, desc: p.join(" ") };
}
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s'-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 1);
}
function scoreEntry(queryTokens, entry) {
    const { name, desc } = getEntryText(entry);
    const nameLower = name.toLowerCase();
    const descLower = desc.toLowerCase();
    let score = 0;
    for (const token of queryTokens) {
        if (nameLower.includes(token))
            score += 3;
        if (descLower.includes(token))
            score += 1;
    }
    return score;
}
const MAX_CONTEXT_CHARS = 32000;
function findRelevantEntries(query, categories) {
    const queryTokens = tokenize(query);
    const scored = [];
    for (const cat of categories) {
        const entries = data_js_1.srdData[cat] || [];
        const serialize = serializers_js_1.SERIALIZERS[cat] || ((e) => (0, serializers_js_1.serializeGeneric)(e, cat.toUpperCase()));
        for (const entry of entries) {
            const score = scoreEntry(queryTokens, entry);
            if (score > 0) {
                scored.push({ text: serialize(entry), score });
            }
        }
    }
    scored.sort((a, b) => b.score - a.score);
    let totalChars = 0;
    const selected = [];
    for (const item of scored) {
        if (totalChars + item.text.length > MAX_CONTEXT_CHARS)
            break;
        selected.push(item.text);
        totalChars += item.text.length;
    }
    return selected.join("\n\n---\n\n");
}
