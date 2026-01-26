/**
 * Calculate the ability score modifier based on the ability score value
 * @param {number} abilityScore - The ability score (1-30)
 * @returns {number|string} The modifier value
 */
export function calculateAbilityScoreModifier(abilityScore) {
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
      return "0";
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
      return "0";
  }
}

/**
 * Calculate proficiency bonus based on character level
 * @param {number} level - Character level
 * @returns {number} The proficiency bonus
 */
export function calculateProBonus(level) {
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

/**
 * Calculate proficiency value for a skill or saving throw
 * @param {number} ability - The ability score
 * @param {boolean} isPro - Whether proficient
 * @param {number} level - Character level (for proficiency bonus)
 * @param {number} skillMod - Additional skill modifier
 * @returns {number|string} The total proficiency value
 */
export function calculateProficiency(ability, isPro, level, skillMod) {
  let abilityMod = calculateAbilityScoreModifier(ability);
  if (abilityMod === "0") abilityMod = 0;
  let pro = abilityMod;
  if (isPro) {
    pro += calculateProBonus(level);
  }
  if (skillMod) {
    pro += skillMod;
  }
  if (pro === 0) pro = "0";
  return pro;
}

/**
 * Calculate passive perception
 * @param {object} generalData - The character's general data
 * @returns {number} The passive perception value
 */
export function calculatePassivePerception(generalData) {
  let wis = calculateAbilityScoreModifier(generalData.wisdom);
  if (wis === "0") wis = 0;
  let pp = 10 + wis;
  if (generalData.proficiencies.perception) {
    pp += calculateProBonus(generalData.level);
  }
  if (generalData.wisdom_mod) {
    pp += generalData.wisdom_mod;
  }
  return pp;
}

/**
 * Calculate spell save DC
 * @param {object} generalData - The character's general data
 * @returns {number} The spell save DC
 */
export function calculateSpellSaveDC(generalData) {
  let spellSaveDC = 8;
  if (generalData.spell_slots.spell_casting_ability) {
    const abilityScore =
      generalData[generalData.spell_slots.spell_casting_ability];
    let mod = calculateAbilityScoreModifier(abilityScore);
    if (mod === "0") mod = 0;
    spellSaveDC += mod;
  }

  spellSaveDC += calculateProBonus(generalData.level);

  if (spellSaveDC === 0) spellSaveDC = 0;
  return spellSaveDC;
}

/**
 * Calculate spell attack bonus
 * @param {object} generalData - The character's general data
 * @returns {number} The spell attack bonus
 */
export function calculateSpellAttackBonus(generalData) {
  let bonus = 0;
  if (generalData.spell_slots.spell_casting_ability) {
    const abilityScore =
      generalData[generalData.spell_slots.spell_casting_ability];
    let mod = calculateAbilityScoreModifier(abilityScore);
    if (mod === "0") mod = 0;
    bonus += mod;
  }

  bonus += calculateProBonus(generalData.level);

  if (bonus === 0) bonus = 0;
  return bonus;
}
