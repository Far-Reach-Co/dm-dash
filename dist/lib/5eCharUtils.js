"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpellSlotTotalByOption = exports.getSpellSlotExpendedByOption = exports.getSpellQueryTitleByOption = exports.calculateTotalEquipmentWeight = exports.calculateSpellAttackBonus = exports.calculateSpellSaveDC = exports.getAbilityScoreFromSpellCastingAbilityOrNull = exports.calculateProficiency = exports.calculatePassivePerception = exports.calculateProBonus = exports.calculateAbilityScoreModifier = void 0;
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
function calculateTotalEquipmentWeight(equipment) {
    let weight = 0;
    equipment.forEach((item) => {
        weight += item.weight;
    });
    return weight;
}
exports.calculateTotalEquipmentWeight = calculateTotalEquipmentWeight;
function getSpellQueryTitleByOption(option) {
    switch (option) {
        case "cantrips":
            return "cantrip";
        case "first-level":
            return "First level";
        case "second-level":
            return "Second level";
        case "third-level":
            return "Third level";
        case "fourth-level":
            return "Fourth level";
        case "fifth-level":
            return "Fifth level";
        case "sixth-level":
            return "Sixth level";
        case "seventh-level":
            return "Seventh level";
        case "eighth-level":
            return "Eighth level";
        case "nineth-level":
            return "Nineth level";
        default:
            return "cantrip";
    }
}
exports.getSpellQueryTitleByOption = getSpellQueryTitleByOption;
function getSpellSlotExpendedByOption(option, spellInfo) {
    switch (option) {
        case "first-level":
            return spellInfo.first_expended;
        case "second-level":
            return spellInfo.second_expended;
        case "third-level":
            return spellInfo.third_expended;
        case "fourth-level":
            return spellInfo.fourth_expended;
        case "fifth-level":
            return spellInfo.fifth_expended;
        case "sixth-level":
            return spellInfo.sixth_expended;
        case "seventh-level":
            return spellInfo.seventh_expended;
        case "eighth-level":
            return spellInfo.eigth_expended;
        case "nineth-level":
            return spellInfo.nineth_expended;
        default:
            return "";
    }
}
exports.getSpellSlotExpendedByOption = getSpellSlotExpendedByOption;
function getSpellSlotTotalByOption(option, spellInfo) {
    switch (option) {
        case "first-level":
            return spellInfo.first_total;
        case "second-level":
            return spellInfo.second_total;
        case "third-level":
            return spellInfo.third_total;
        case "fourth-level":
            return spellInfo.fourth_total;
        case "fifth-level":
            return spellInfo.fifth_total;
        case "sixth-level":
            return spellInfo.sixth_total;
        case "seventh-level":
            return spellInfo.seventh_total;
        case "eighth-level":
            return spellInfo.eigth_total;
        case "nineth-level":
            return spellInfo.nineth_total;
        default:
            return "";
    }
}
exports.getSpellSlotTotalByOption = getSpellSlotTotalByOption;
