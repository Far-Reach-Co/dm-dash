import { DndFiveEGeneralModel } from "../api/queries/5eCharGeneral";

export function calculateAbilityScoreModifier(abilityScore: number) {
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

export function calculateProBonus(level: number) {
  if (!level) return 0;
  if (level < 5) {
    return 2;
  } else if (level < 9) {
    return 3;
  } else if (level < 13) {
    return 4;
  } else if (level < 17) {
    return 5;
  } else return 6;
}

export function calculatePassivePerception(
  wisdom: number,
  wisdom_mod: number,
  perceptionProficiency: boolean,
  level: number
) {
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

export function calculateProficiency(
  ability: number,
  isPro: boolean,
  level: number
) {
  let abilityMod = calculateAbilityScoreModifier(ability);
  if (abilityMod == 0) abilityMod = 0;
  let pro = abilityMod;
  if (isPro) {
    pro += calculateProBonus(level);
  }
  return pro;
}

export function getAbilityScoreFromSpellCastingAbilityOrNull(
  spellCastingAbility: string,
  charGeneral: DndFiveEGeneralModel
) {
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

export function calculateSpellSaveDC(
  abilityScore: number | null,
  level: number
) {
  let spellSaveDC = 8;
  if (abilityScore) {
    let mod = calculateAbilityScoreModifier(abilityScore);
    spellSaveDC += mod;
  }
  spellSaveDC += calculateProBonus(level);
  return spellSaveDC;
}

export function calculateSpellAttackBonus(
  abilityScore: number | null,
  level: number
) {
  let bonus = 0;
  if (abilityScore) {
    let mod = calculateAbilityScoreModifier(abilityScore);
    bonus += mod;
  }
  bonus += calculateProBonus(level);
  return bonus;
}
