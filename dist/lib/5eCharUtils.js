"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSpellAttackBonus = exports.calculateSpellSaveDC = exports.getAbilityScoreFromSpellCastingAbilityOrNull = exports.calculateProficiency = exports.calculatePassivePerception = exports.calculateProBonus = exports.calculateAbilityScoreModifier = void 0;
function calculateAbilityScoreModifier(abilityScore) {
    switch (abilityScore) {
        case 1:
            return -5;
        case 2:
        case 3:
            return -4;
        case 4:
        case 5:
            return -3;
        case 6:
        case 7:
            return -2;
        case 8:
        case 9:
            return -1;
        case 10:
        case 11:
            return 0;
        case 12:
        case 13:
            return 1;
        case 14:
        case 15:
            return 2;
        case 16:
        case 17:
            return 3;
        case 18:
        case 19:
            return 4;
        case 20:
        case 21:
            return 5;
        case 22:
        case 23:
            return 6;
        case 24:
        case 25:
            return 7;
        case 26:
        case 27:
            return 8;
        case 28:
        case 29:
            return 9;
        case 30:
            return 10;
        default:
            return 0;
    }
}
exports.calculateAbilityScoreModifier = calculateAbilityScoreModifier;
function calculateProBonus(level) {
    if (!level)
        return 0;
    if (level < 5) {
        return 2;
    }
    else if (level < 9) {
        return 3;
    }
    else if (level < 13) {
        return 4;
    }
    else if (level < 17) {
        return 5;
    }
    else
        return 6;
}
exports.calculateProBonus = calculateProBonus;
function calculatePassivePerception(wisdom, wisdom_mod, perceptionProficiency, level) {
    let wis = calculateAbilityScoreModifier(wisdom);
    let pp = 10 + wis;
    if (perceptionProficiency) {
        pp += calculateProBonus(level);
    }
    if (wisdom_mod) {
        pp += wisdom_mod;
    }
    return pp;
}
exports.calculatePassivePerception = calculatePassivePerception;
function calculateProficiency(ability, isPro, level) {
    let abilityMod = calculateAbilityScoreModifier(ability);
    if (abilityMod == 0)
        abilityMod = 0;
    let pro = abilityMod;
    if (isPro) {
        pro += calculateProBonus(level);
    }
    return pro;
}
exports.calculateProficiency = calculateProficiency;
function getAbilityScoreFromSpellCastingAbilityOrNull(spellCastingAbility, charGeneral) {
    switch (spellCastingAbility) {
        case "None":
            return null;
        case "strength":
            return charGeneral.strength;
        case "dexterity":
            return charGeneral.dexterity;
        case "constitution":
            return charGeneral.constitution;
        case "intelligence":
            return charGeneral.intelligence;
        case "wisdom":
            return charGeneral.wisdom;
        case "charisma":
            return charGeneral.charisma;
        default:
            return null;
    }
}
exports.getAbilityScoreFromSpellCastingAbilityOrNull = getAbilityScoreFromSpellCastingAbilityOrNull;
function calculateSpellSaveDC(abilityScore, level) {
    let spellSaveDC = 8;
    if (abilityScore) {
        let mod = calculateAbilityScoreModifier(abilityScore);
        spellSaveDC += mod;
    }
    spellSaveDC += calculateProBonus(level);
    return spellSaveDC;
}
exports.calculateSpellSaveDC = calculateSpellSaveDC;
function calculateSpellAttackBonus(abilityScore, level) {
    let bonus = 0;
    if (abilityScore) {
        let mod = calculateAbilityScoreModifier(abilityScore);
        bonus += mod;
    }
    bonus += calculateProBonus(level);
    return bonus;
}
exports.calculateSpellAttackBonus = calculateSpellAttackBonus;
