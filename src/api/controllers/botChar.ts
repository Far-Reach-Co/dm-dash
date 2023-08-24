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
  getAbilityScoreFromSpellCastingAbilityOrNull,
} from "../../lib/5eCharUtils";
import { get5eCharProByGeneralQuery } from "../queries/5eCharPro";
import { get5eCharSpellSlotInfoQuery } from "../queries/5eCharSpellSlots";

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
    content += `\n**Race:** ${charGeneral.name}`;
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
          // case "add":
          //   // handleAddResponse();
          //   return;
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
      default:
        throw { message: "Missing sub-command name" };
    }
  } catch (err) {
    throw err;
  }
}

export { characterSheetBotCommandResponse };
