import { InteractionResponseType } from "discord-interactions";
import { Request, Response } from "express";
import { redisClient } from "../../lib/socketUsers";
import { URL } from "url";
import {
  get5eCharGeneralQuery,
  get5eCharNamesQuery,
} from "../queries/5eCharGeneral";
import { getPlayerInviteByUUIDQuery } from "../queries/playerInvites";
import {
  calculateAbilityScoreModifier,
  calculatePassivePerception,
  calculateProBonus,
  calculateSpellAttackBonus,
  calculateSpellSaveDC,
  calculateTotalEquipmentWeight,
  getAbilityScoreFromSpellCastingAbilityOrNull,
  getSpellQueryTitleByOption,
  getSpellSlotExpendedByOption,
  getSpellSlotTotalByOption,
} from "../../lib/5eCharUtils";
import { get5eCharProByGeneralQuery } from "../queries/5eCharPro";
import {
  get5eCharSpellSlotInfoQuery,
  get5eCharSpellSlotInfosByGeneralQuery,
} from "../queries/5eCharSpellSlots";
import { get5eCharOtherProLangsByGeneralQuery } from "../queries/5eCharOtherProLang";
import { get5eCharEquipmentsByGeneralQuery } from "../queries/5eCharEquipment";
import { get5eCharAttacksByGeneralQuery } from "../queries/5eCharAttacks";
import { get5eCharFeatsByGeneralQuery } from "../queries/5eCharFeats";
import { get5eCharBackByGeneralQuery } from "../queries/5eCharBack";
import { toTitleCase } from "../../lib/utils";
import { get5eCharSpellsByTypeQuery } from "../queries/5eCharSpells";

async function handleListCommand(req: Request, res: Response) {
  try {
    const discordUserId = req.body.member.user.id;
    //
    const redisData = await redisClient.hGet(
      "bot_character_sheets",
      discordUserId
    );
    if (redisData) {
      const jsonRedisData = JSON.parse(redisData);
      const characterSheetNamesData = await get5eCharNamesQuery(jsonRedisData);
      const names = characterSheetNamesData.rows.map((row) => row.name);
      const namesWithIndex = names.map((name, index) => {
        // IMPORTANT INDEX IS +1 SO NOT TO USE ZERO INDEX
        return `ID: ${index + 1}        ${name};`;
      });
      const content = namesWithIndex.join("\n");
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content,
        },
      });
    } else {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "You have not registered any character sheets yet.",
        },
      });
    }
  } catch (err) {
    throw err;
  }
}

function getIdAndInviteParamsFromUrl(httpLink: string) {
  const urlObj = new URL(httpLink);
  const id = urlObj.searchParams.get("id");
  const invite = urlObj.searchParams.get("invite");
  return { id, invite };
}

async function handleAddCommand(req: Request, res: Response) {
  try {
    // get user, server and cs link
    const discordUserId = req.body.member.user.id;
    // const discordServerId = req.body.guild_id;
    const characterSheetLink = req.body.data.options[0].options[0].value;
    const { id, invite } = getIdAndInviteParamsFromUrl(characterSheetLink);
    if (!id) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "ERROR: Please provide a valid invite link.",
        },
      });
    }
    if (!invite) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "ERROR: Please provide a valid invite link.",
        },
      });
    }

    const characterSheetNames = await get5eCharNamesQuery([id]);
    if (!characterSheetNames.rows.length) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "ERROR: Unable to find character sheet in database.",
        },
      });
    }
    const playerInviteData = await getPlayerInviteByUUIDQuery(invite);
    if (!playerInviteData.rows.length) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content:
            "ERROR: Unable to find invite in database. The invite link may have been revoked.",
        },
      });
    }
    // get previous data
    const redisData = await redisClient.hGet(
      "bot_character_sheets",
      discordUserId
    );
    // if we have data append it
    let updatedData = [];
    if (redisData) {
      updatedData = JSON.parse(redisData);
    }
    updatedData.push(id);

    // set new data
    await redisClient.hSet(
      "bot_character_sheets",
      discordUserId,
      JSON.stringify(updatedData)
    );

    // get character sheet name
    const characterSheetName = characterSheetNames.rows[0].name;
    // respond with success
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `${characterSheetName} has been successfully registered!`,
      },
    });
  } catch (err) {
    throw err;
  }
}

async function handleRemoveCommand(req: Request, res: Response) {
  try {
    const discordUserId = req.body.member.user.id;
    // const discordServerId = req.body.guild_id;
    const characterSheetIndex = req.body.data.options[0].options[0].value;

    const redisData = await redisClient.hGet(
      "bot_character_sheets",
      discordUserId
    );
    if (redisData) {
      const jsonRedisData = JSON.parse(redisData);
      const correctedIndex = parseInt(characterSheetIndex) - 1;
      if (jsonRedisData[correctedIndex]) {
        const newData = jsonRedisData.splice(correctedIndex, 1);
        await redisClient.hSet(
          "bot_character_sheets",
          discordUserId,
          JSON.stringify(newData)
        );
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Character has been successfully removed!",
          },
        });
      } else {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
              "ERROR: This ID does not match any character sheet currently registered",
          },
        });
      }
    } else {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "ERROR: You do not have any character sheets registered",
        },
      });
    }
  } catch (err) {
    throw err;
  }
}

async function handleGetBackgroundResponse(
  charGeneralId: string | number,
  res: Response
) {
  try {
    const backgroundData = await get5eCharBackByGeneralQuery(charGeneralId);
    const background = backgroundData.rows[0];

    let totalCharCount = 0;

    let content = "";
    content += `**Background:** ${background.background}`;
    content += `\n**Alignment:** ${background.alignment}`;
    content += `\n**Age:** ${background.age}`;
    content += `\n**Eyes:** ${background.eyes}`;
    content += `\n**Skin:** ${background.skin}`;
    content += `\n**Hair:** ${background.hair}`;
    content += `\n**Height:** ${background.height}`;
    content += `\n**Weight:** ${background.weight}`;

    // update char count for limit
    totalCharCount += content.length;

    const backgroundListItems = [
      {
        title: "Personality Traits",
        description: background.personality_traits,
      },
      {
        title: "Ideals",
        description: background.ideals,
      },
      {
        title: "Bonds",
        description: background.ideals,
      },
      {
        title: "Flaws",
        description: background.ideals,
      },
      {
        title: "Appearance",
        description: background.appearance,
      },
      {
        title: "Backstory",
        description: background.backstory,
      },
      {
        title: "Allies & Organizations",
        description: background.allies_and_organizations,
      },
      {
        title: "Other Info",
        description: background.other_info,
      },
    ];

    const embeds: any[] = [];
    for (const item of backgroundListItems) {
      // add to total char count for limit
      if (item.title && item.title.length) totalCharCount += item.title.length;
      if (item.description && item.description.length)
        totalCharCount += item.description.length;

      if (totalCharCount > 6000 || embeds.length >= 10) {
        // discord limit for embeds
        break;
      }

      embeds.push(item);
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content,
        embeds,
      },
    });
  } catch (err) {
    throw err;
  }
}

async function handleGetFeatsResponse(
  charGeneralId: string | number,
  res: Response
) {
  try {
    const featsData = await get5eCharFeatsByGeneralQuery(charGeneralId);
    let totalCharCount = 0;
    const embeds: any[] = [];
    for (const feat of featsData.rows) {
      // add to total char count for limit
      if (feat.title && feat.title.length) totalCharCount += feat.title.length;
      if (feat.description && feat.description.length)
        totalCharCount += feat.description.length;

      if (totalCharCount > 6000 || embeds.length >= 10) {
        // discord limit for embeds
        break;
      }

      embeds.push({
        title: feat.title,
        description: feat.description,
      });
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "**Feats & Traits**",
        embeds,
      },
    });
  } catch (err) {
    throw err;
  }
}

async function handleGetAttacksResponse(
  charGeneralId: string | number,
  res: Response
) {
  try {
    const attacksData = await get5eCharAttacksByGeneralQuery(charGeneralId);

    let content = "";
    content += `**Attacks & Spellcasting**`;
    attacksData.rows.forEach((attack) => {
      if (!attack.title) return;
      content += `\n**${attack.title}:** Range: ${
        attack.range ? attack.range : "None"
      }, Duration: ${attack.duration ? attack.duration : "None"}, Bonus: ${
        attack.bonus ? attack.bonus : "None"
      }, Damage/Type: ${attack.damage_type ? attack.damage_type : "None"}`;
    });

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content,
      },
    });
  } catch (err) {
    throw err;
  }
}

async function handleGetCurrencyResponse(
  charGeneralId: string | number,
  res: Response
) {
  try {
    const charGeneralData = await get5eCharGeneralQuery(charGeneralId);
    const charGeneral = charGeneralData.rows[0];

    let content = "";
    content += `**Currency**`;
    content += `\n**Copper:** ${charGeneral.copper}`;
    content += `\n**Silver:** ${charGeneral.silver}`;
    content += `\n**Electrum:** ${charGeneral.electrum}`;
    content += `\n**Gold:** ${charGeneral.gold}`;
    content += `\n**Platinum:** ${charGeneral.platinum}`;

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content,
      },
    });
  } catch (err) {
    throw err;
  }
}

async function handleGetEquipmentResponse(
  charGeneralId: string | number,
  res: Response
) {
  try {
    const equipmentData = await get5eCharEquipmentsByGeneralQuery(
      charGeneralId
    );

    let content = "";
    content += `**Equipment**`;
    equipmentData.rows.forEach((eq) => {
      if (!eq.title) return;
      content += `\n**${eq.title}:** Quantity: ${eq.quantity}, Weight: ${eq.weight}`;
    });
    content += `\n\n**TOTAL WEIGHT:** ${calculateTotalEquipmentWeight(
      equipmentData.rows
    )}`;

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content,
      },
    });
  } catch (err) {
    throw err;
  }
}
async function handleGetDeathSavesResponse(
  charGeneralId: string | number,
  res: Response
) {
  try {
    const charGeneralData = await get5eCharGeneralQuery(charGeneralId);
    const charGeneral = charGeneralData.rows[0];

    let content = "";
    content += `**Death Saves**`;
    content += `\n**Successes:** (${charGeneral.ds_success_1 ? "●" : "○"}) - (${
      charGeneral.ds_success_2 ? "●" : "○"
    }) - (${charGeneral.ds_success_3 ? "●" : "○"})`;
    content += `\n**Failures:** (${charGeneral.ds_failure_1 ? "●" : "○"}) - (${
      charGeneral.ds_failure_2 ? "●" : "○"
    }) - (${charGeneral.ds_failure_3 ? "●" : "○"})`;

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content,
      },
    });
  } catch (err) {
    throw err;
  }
}

async function handleGetOtherProLangResponse(
  charGeneralId: string | number,
  res: Response
) {
  try {
    const otherProLangData = await get5eCharOtherProLangsByGeneralQuery(
      charGeneralId
    );

    let content = "";
    content += `**Other Proficiencies & Languages**`;
    otherProLangData.rows.forEach((op) => {
      if (!op.type) return;
      content += `\n**${op.type}:** ${op.proficiency}`;
    });

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content,
      },
    });
  } catch (err) {
    throw err;
  }
}

async function handleGetSkillsResponse(
  charGeneralId: string | number,
  res: Response
) {
  try {
    const charGeneralData = await get5eCharGeneralQuery(charGeneralId);
    const charGeneral = charGeneralData.rows[0];
    // proficiencies
    const proData = await get5eCharProByGeneralQuery(charGeneralId);
    const proficiencies = proData.rows[0];

    let content = "";
    content += `**Skills**`;
    content += `\n(${proficiencies.acrobatics ? "●" : "○"}) ${
      proficiencies.acrobatics
        ? calculateAbilityScoreModifier(charGeneral.dexterity) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.dexterity)
    } **Acrobatics (dex)**`;
    content += `\n(${proficiencies.animal_handling ? "●" : "○"}) ${
      proficiencies.animal_handling
        ? calculateAbilityScoreModifier(charGeneral.wisdom) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.wisdom)
    } **Animal Handling (wis)**`;
    content += `\n(${proficiencies.arcana ? "●" : "○"}) ${
      proficiencies.arcana
        ? calculateAbilityScoreModifier(charGeneral.intelligence) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.intelligence)
    } **Arcana (int)**`;
    content += `\n(${proficiencies.athletics ? "●" : "○"}) ${
      proficiencies.athletics
        ? calculateAbilityScoreModifier(charGeneral.strength) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.strength)
    } **Athletics (str)**`;
    content += `\n(${proficiencies.deception ? "●" : "○"}) ${
      proficiencies.deception
        ? calculateAbilityScoreModifier(charGeneral.charisma) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.charisma)
    } **Deception (cha)**`;
    content += `\n(${proficiencies.history ? "●" : "○"}) ${
      proficiencies.history
        ? calculateAbilityScoreModifier(charGeneral.intelligence) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.intelligence)
    } **History (int)**`;
    content += `\n(${proficiencies.insight ? "●" : "○"}) ${
      proficiencies.insight
        ? calculateAbilityScoreModifier(charGeneral.wisdom) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.wisdom)
    } **Insight (wis)**`;
    content += `\n(${proficiencies.intimidation ? "●" : "○"}) ${
      proficiencies.intimidation
        ? calculateAbilityScoreModifier(charGeneral.charisma) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.charisma)
    } **Intimidation (cha)**`;
    content += `\n(${proficiencies.investigation ? "●" : "○"}) ${
      proficiencies.investigation
        ? calculateAbilityScoreModifier(charGeneral.intelligence) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.intelligence)
    } **Investigation (int)**`;
    content += `\n(${proficiencies.medicine ? "●" : "○"}) ${
      proficiencies.medicine
        ? calculateAbilityScoreModifier(charGeneral.wisdom) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.wisdom)
    } **nature (wis)**`;
    content += `\n(${proficiencies.nature ? "●" : "○"}) ${
      proficiencies.nature
        ? calculateAbilityScoreModifier(charGeneral.intelligence) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.intelligence)
    } **Nature (int)**`;
    content += `\n(${proficiencies.perception ? "●" : "○"}) ${
      proficiencies.perception
        ? calculateAbilityScoreModifier(charGeneral.wisdom) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.wisdom)
    } **Perception (wis)**`;
    content += `\n(${proficiencies.performance ? "●" : "○"}) ${
      proficiencies.performance
        ? calculateAbilityScoreModifier(charGeneral.charisma) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.charisma)
    } **Performance (cha)**`;
    content += `\n(${proficiencies.persuasion ? "●" : "○"}) ${
      proficiencies.persuasion
        ? calculateAbilityScoreModifier(charGeneral.charisma) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.charisma)
    } **Persuasion (cha)**`;
    content += `\n(${proficiencies.religion ? "●" : "○"}) ${
      proficiencies.religion
        ? calculateAbilityScoreModifier(charGeneral.intelligence) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.intelligence)
    } **Religion (int)**`;
    content += `\n(${proficiencies.sleight_of_hand ? "●" : "○"}) ${
      proficiencies.sleight_of_hand
        ? calculateAbilityScoreModifier(charGeneral.dexterity) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.dexterity)
    } **Sleight of Hand (dex)**`;
    content += `\n(${proficiencies.stealth ? "●" : "○"}) ${
      proficiencies.stealth
        ? calculateAbilityScoreModifier(charGeneral.dexterity) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.dexterity)
    } **Stealth (dex)**`;
    content += `\n(${proficiencies.survival ? "●" : "○"}) ${
      proficiencies.survival
        ? calculateAbilityScoreModifier(charGeneral.wisdom) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.wisdom)
    } **Survival (wis)**`;

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content,
      },
    });
  } catch (err) {
    throw err;
  }
}

async function handleGetSavingThrowsResponse(
  charGeneralId: string | number,
  res: Response
) {
  try {
    const charGeneralData = await get5eCharGeneralQuery(charGeneralId);
    const charGeneral = charGeneralData.rows[0];
    // proficiencies
    const proData = await get5eCharProByGeneralQuery(charGeneralId);
    const proficiencies = proData.rows[0];

    let content = "";
    content += `**Saving Throws**`;
    content += `\n**STR**(${proficiencies.sv_str ? "●" : "○"}) - ${
      proficiencies.sv_str
        ? calculateAbilityScoreModifier(charGeneral.strength) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.strength)
    }`;
    content += `\n**DEX**(${proficiencies.sv_dex ? "●" : "○"}) - ${
      proficiencies.sv_dex
        ? calculateAbilityScoreModifier(charGeneral.dexterity) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.dexterity)
    }`;
    content += `\n**CON**(${proficiencies.sv_con ? "●" : "○"}) - ${
      proficiencies.sv_con
        ? calculateAbilityScoreModifier(charGeneral.constitution) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.constitution)
    }`;
    content += `\n**CON**(${proficiencies.sv_int ? "●" : "○"}) - ${
      proficiencies.sv_int
        ? calculateAbilityScoreModifier(charGeneral.intelligence) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.intelligence)
    }`;
    content += `\n**CON**(${proficiencies.sv_wis ? "●" : "○"}) - ${
      proficiencies.sv_wis
        ? calculateAbilityScoreModifier(charGeneral.wisdom) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.wisdom)
    }`;
    content += `\n**CON**(${proficiencies.sv_char ? "●" : "○"}) - ${
      proficiencies.sv_char
        ? calculateAbilityScoreModifier(charGeneral.charisma) +
          calculateProBonus(charGeneral.level)
        : calculateAbilityScoreModifier(charGeneral.charisma)
    }`;

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content,
      },
    });
  } catch (err) {
    throw err;
  }
}

async function handleGetGeneralInfoResponse(
  charGeneralId: string | number,
  res: Response
) {
  try {
    // get necessary data from db
    const charGeneralData = await get5eCharGeneralQuery(charGeneralId);
    const charGeneral = charGeneralData.rows[0];
    // proficiencies
    const proData = await get5eCharProByGeneralQuery(charGeneralId);
    const proficiencies = proData.rows[0];
    // spell info
    const spellInfoData = await get5eCharSpellSlotInfoQuery(charGeneralId);
    const spellInfo = spellInfoData.rows[0];

    // format data
    let content = "";
    content += `**${charGeneral.name}**`;
    content += `\n**Race:** ${charGeneral.race}`;
    content += `\n**Class:** ${charGeneral.class}`;
    if (charGeneral.subclass)
      content += `\n**Sub-Class:** ${charGeneral.subclass}`;
    if (charGeneral.other_class)
      content += `\n**Other-Class:** ${charGeneral.other_class}`;
    content += `\n**Level:** ${charGeneral.level}`;
    content += `\n**EXP:** ${charGeneral.exp}`;
    content += `\n**Inspiration:** ${charGeneral.inspiration ? "Yes" : "No"}`;
    content += `\n**AC:** ${charGeneral.armor_class}`;
    content += `\n**Initiative:** ${charGeneral.initiative}`;
    content += `\n**Speed:** ${charGeneral.speed}`;
    content += `\n**Hit Dice:** ${charGeneral.hit_dice} / ${charGeneral.hit_dice_total}`;
    content += `\n**HP:** ${charGeneral.current_hp + charGeneral.temp_hp} / ${
      charGeneral.max_hp
    }`;
    content += `\n**STR:** ${
      charGeneral.strength
    } (${calculateAbilityScoreModifier(charGeneral.strength)})`;
    content += `\n**DEX:** ${
      charGeneral.dexterity
    } (${calculateAbilityScoreModifier(charGeneral.dexterity)})`;
    content += `\n**CON:** ${
      charGeneral.constitution
    } (${calculateAbilityScoreModifier(charGeneral.constitution)})`;
    content += `\n**INT:** ${
      charGeneral.intelligence
    } (${calculateAbilityScoreModifier(charGeneral.intelligence)})`;
    content += `\n**WIS:** ${
      charGeneral.wisdom
    } (${calculateAbilityScoreModifier(charGeneral.wisdom)})`;
    content += `\n**CHA:** ${
      charGeneral.charisma
    } (${calculateAbilityScoreModifier(charGeneral.charisma)})`;
    content += `\n**Proficiency Bonus:** ${calculateProBonus(
      charGeneral.level
    )}`;
    content += `\n**Passive Perception:** ${calculatePassivePerception(
      charGeneral.wisdom,
      charGeneral.wisdom_mod,
      proficiencies.perception,
      charGeneral.level
    )}`;
    content += `\n**Spell Save DC:** ${calculateSpellSaveDC(
      getAbilityScoreFromSpellCastingAbilityOrNull(
        spellInfo.spell_casting_ability,
        charGeneral
      ),
      charGeneral.level
    )}`;
    content += `\n**Spell Attack Bonus:** ${calculateSpellAttackBonus(
      getAbilityScoreFromSpellCastingAbilityOrNull(
        spellInfo.spell_casting_ability,
        charGeneral
      ),
      charGeneral.level
    )}`;
    if (
      charGeneral.class_resource &&
      charGeneral.class_resource_total &&
      charGeneral.class_resource_title
    ) {
      content += `\n**Class Resource (${charGeneral.class_resource_title}):** ${charGeneral.class_resource} / ${charGeneral.class_resource_total}`;
    }
    if (
      charGeneral.other_resource &&
      charGeneral.other_resource_total &&
      charGeneral.other_resource_title
    ) {
      content += `\n**Other Resource (${charGeneral.other_resource_title}):** ${charGeneral.other_resource} / ${charGeneral.other_resource_total}`;
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content,
      },
    });
  } catch (err) {
    throw err;
  }
}

async function handleGetCommand(req: Request, res: Response) {
  try {
    const discordUserId = req.body.member.user.id;
    const characterSheetIndex = req.body.data.options[0].options[0].value;
    const detailsOptionSelect = req.body.data.options[0].options[1].value;
    const redisData = await redisClient.hGet(
      "bot_character_sheets",
      discordUserId
    );
    if (redisData) {
      const jsonRedisData = JSON.parse(redisData);
      const correctedIndex = parseInt(characterSheetIndex) - 1;
      if (jsonRedisData[correctedIndex]) {
        const charGeneralId = jsonRedisData[correctedIndex];

        switch (detailsOptionSelect) {
          case "general-info":
            return handleGetGeneralInfoResponse(charGeneralId, res);
          case "saving-throws":
            return handleGetSavingThrowsResponse(charGeneralId, res);
          case "skills":
            return handleGetSkillsResponse(charGeneralId, res);
          case "other-proficiencies-and-languages":
            return handleGetOtherProLangResponse(charGeneralId, res);
          case "death-saves":
            return handleGetDeathSavesResponse(charGeneralId, res);
          case "equipment":
            return handleGetEquipmentResponse(charGeneralId, res);
          case "currency":
            return handleGetCurrencyResponse(charGeneralId, res);
          case "attacks-and-spellcasting":
            return handleGetAttacksResponse(charGeneralId, res);
          case "feats-and-traits":
            return handleGetFeatsResponse(charGeneralId, res);
          case "background":
            return handleGetBackgroundResponse(charGeneralId, res);
          default:
            throw { message: "Missing details option selection" };
        }
      } else {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
              "ERROR: This ID does not match any character sheet currently registered",
          },
        });
      }
    } else {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "ERROR: You do not have any character sheets registered",
        },
      });
    }
  } catch (err) {
    throw err;
  }
}

async function handleSpellsCommand(req: Request, res: Response) {
  try {
    const discordUserId = req.body.member.user.id;
    const characterSheetIndex = req.body.data.options[0].options[0].value;
    const detailsOptionSelect = req.body.data.options[0].options[1].value;
    const redisData = await redisClient.hGet(
      "bot_character_sheets",
      discordUserId
    );
    if (redisData) {
      const jsonRedisData = JSON.parse(redisData);
      const correctedIndex = parseInt(characterSheetIndex) - 1;
      if (jsonRedisData[correctedIndex]) {
        const charGeneralId = jsonRedisData[correctedIndex];
        const spellInfoData = await get5eCharSpellSlotInfosByGeneralQuery(
          charGeneralId
        );
        const spellInfo = spellInfoData.rows[0];
        const spellsData = await get5eCharSpellsByTypeQuery(
          charGeneralId,
          getSpellQueryTitleByOption(detailsOptionSelect)
        );

        let totalCharCount = 0;
        const embeds: any[] = [];
        for (var spell of spellsData.rows) {
          let description = "";
          if (detailsOptionSelect !== "cantrips") {
            description += `\n**Spell Slots:** ${getSpellSlotExpendedByOption(
              detailsOptionSelect,
              spellInfo
            )} / ${getSpellSlotTotalByOption(detailsOptionSelect, spellInfo)}`;
          }
          description += `\n**Casting Time:** ${spell.casting_time}`;
          description += `\n**Duration:** ${spell.duration}`;
          description += `\n**Range:** ${spell.range}`;
          description += `\n**Damage Type:** ${spell.damage_type}`;
          description += `\n**Components:** ${spell.components}`;
          description += `\n**Description:** ${spell.description}`;

          // add to total char count for limit
          if (spell.title && spell.title.length)
            totalCharCount += spell.title.length;
          if (spell.description && spell.description.length)
            totalCharCount += spell.description.length;

          if (totalCharCount > 6000 || embeds.length >= 10) {
            // discord limit
            break;
          }

          embeds.push({
            title: spell.title,
            description,
          });
        }

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `**${toTitleCase(
              detailsOptionSelect.replace("-", " ")
            )}**`,
            embeds,
          },
        });
      } else {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
              "ERROR: This ID does not match any character sheet currently registered",
          },
        });
      }
    } else {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "ERROR: You do not have any character sheets registered",
        },
      });
    }
  } catch (err) {
    throw err;
  }
}

async function characterSheetBotCommandResponse(req: Request, res: Response) {
  try {
    switch (req.body.data.options[0].name) {
      case "list":
        return handleListCommand(req, res);
      case "add":
        return handleAddCommand(req, res);
      case "remove":
        return handleRemoveCommand(req, res);
      case "get":
        return handleGetCommand(req, res);
      case "spells":
        return handleSpellsCommand(req, res);
      default:
        throw { message: "Missing sub-command name" };
    }
  } catch (err) {
    throw err;
  }
}

export { characterSheetBotCommandResponse };
