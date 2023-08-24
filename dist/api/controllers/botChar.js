"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.characterSheetBotCommandResponse = void 0;
const discord_interactions_1 = require("discord-interactions");
const socketUsers_1 = require("../../lib/socketUsers");
const url_1 = require("url");
const _5eCharGeneral_1 = require("../queries/5eCharGeneral");
const playerInvites_1 = require("../queries/playerInvites");
const _5eCharUtils_1 = require("../../lib/5eCharUtils");
const _5eCharPro_1 = require("../queries/5eCharPro");
const _5eCharSpellSlots_1 = require("../queries/5eCharSpellSlots");
const _5eCharOtherProLang_1 = require("../queries/5eCharOtherProLang");
const _5eCharEquipment_1 = require("../queries/5eCharEquipment");
const _5eCharAttacks_1 = require("../queries/5eCharAttacks");
const _5eCharFeats_1 = require("../queries/5eCharFeats");
const _5eCharBack_1 = require("../queries/5eCharBack");
const utils_1 = require("../../lib/utils");
const _5eCharSpells_1 = require("../queries/5eCharSpells");
function handleListCommand(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const discordUserId = req.body.member.user.id;
            const redisData = yield socketUsers_1.redisClient.hGet("bot_character_sheets", discordUserId);
            if (redisData) {
                const jsonRedisData = JSON.parse(redisData);
                const characterSheetNamesData = yield (0, _5eCharGeneral_1.get5eCharNamesQuery)(jsonRedisData);
                const names = characterSheetNamesData.rows.map((row) => row.name);
                const namesWithIndex = names.map((name, index) => {
                    return `ID: ${index + 1}        ${name};`;
                });
                const content = namesWithIndex.join("\n");
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content,
                    },
                });
            }
            else {
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "You have not registered any character sheets yet.",
                    },
                });
            }
        }
        catch (err) {
            throw err;
        }
    });
}
function getIdAndInviteParamsFromUrl(httpLink) {
    const urlObj = new url_1.URL(httpLink);
    const id = urlObj.searchParams.get("id");
    const invite = urlObj.searchParams.get("invite");
    return { id, invite };
}
function handleAddCommand(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const discordUserId = req.body.member.user.id;
            const characterSheetLink = req.body.data.options[0].options[0].value;
            const { id, invite } = getIdAndInviteParamsFromUrl(characterSheetLink);
            if (!id) {
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "ERROR: Please provide a valid invite link.",
                    },
                });
            }
            if (!invite) {
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "ERROR: Please provide a valid invite link.",
                    },
                });
            }
            const characterSheetNames = yield (0, _5eCharGeneral_1.get5eCharNamesQuery)([id]);
            if (!characterSheetNames.rows.length) {
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "ERROR: Unable to find character sheet in database.",
                    },
                });
            }
            const playerInviteData = yield (0, playerInvites_1.getPlayerInviteByUUIDQuery)(invite);
            if (!playerInviteData.rows.length) {
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "ERROR: Unable to find invite in database. The invite link may have been revoked.",
                    },
                });
            }
            const redisData = yield socketUsers_1.redisClient.hGet("bot_character_sheets", discordUserId);
            let updatedData = [];
            if (redisData) {
                updatedData = JSON.parse(redisData);
            }
            updatedData.push(id);
            yield socketUsers_1.redisClient.hSet("bot_character_sheets", discordUserId, JSON.stringify(updatedData));
            const characterSheetName = characterSheetNames.rows[0].name;
            return res.send({
                type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `${characterSheetName} has been successfully registered!`,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function handleRemoveCommand(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const discordUserId = req.body.member.user.id;
            const characterSheetIndex = req.body.data.options[0].options[0].value;
            const redisData = yield socketUsers_1.redisClient.hGet("bot_character_sheets", discordUserId);
            if (redisData) {
                const jsonRedisData = JSON.parse(redisData);
                const correctedIndex = parseInt(characterSheetIndex) - 1;
                if (jsonRedisData[correctedIndex]) {
                    const newData = jsonRedisData.splice(correctedIndex, 1);
                    yield socketUsers_1.redisClient.hSet("bot_character_sheets", discordUserId, JSON.stringify(newData));
                    return res.send({
                        type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: "Character has been successfully removed!",
                        },
                    });
                }
                else {
                    return res.send({
                        type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: "ERROR: This ID does not match any character sheet currently registered",
                        },
                    });
                }
            }
            else {
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "ERROR: You do not have any character sheets registered",
                    },
                });
            }
        }
        catch (err) {
            throw err;
        }
    });
}
function handleGetBackgroundResponse(charGeneralId, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const backgroundData = yield (0, _5eCharBack_1.get5eCharBackByGeneralQuery)(charGeneralId);
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
            const embeds = [];
            for (const item of backgroundListItems) {
                if (item.title && item.title.length)
                    totalCharCount += item.title.length;
                if (item.description && item.description.length)
                    totalCharCount += item.description.length;
                if (totalCharCount > 6000 || embeds.length >= 10) {
                    break;
                }
                embeds.push(item);
            }
            return res.send({
                type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content,
                    embeds,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function handleGetFeatsResponse(charGeneralId, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const featsData = yield (0, _5eCharFeats_1.get5eCharFeatsByGeneralQuery)(charGeneralId);
            let totalCharCount = 0;
            const embeds = [];
            for (const feat of featsData.rows) {
                if (feat.title && feat.title.length)
                    totalCharCount += feat.title.length;
                if (feat.description && feat.description.length)
                    totalCharCount += feat.description.length;
                if (totalCharCount > 6000 || embeds.length >= 10) {
                    break;
                }
                embeds.push({
                    title: feat.title,
                    description: feat.description,
                });
            }
            return res.send({
                type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: "**Feats & Traits**",
                    embeds,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function handleGetAttacksResponse(charGeneralId, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const attacksData = yield (0, _5eCharAttacks_1.get5eCharAttacksByGeneralQuery)(charGeneralId);
            let content = "";
            content += `**Attacks & Spellcasting**`;
            attacksData.rows.forEach((attack) => {
                if (!attack.title)
                    return;
                content += `\n**${attack.title}:** Range: ${attack.range ? attack.range : "None"}, Duration: ${attack.duration ? attack.duration : "None"}, Bonus: ${attack.bonus ? attack.bonus : "None"}, Damage/Type: ${attack.damage_type ? attack.damage_type : "None"}`;
            });
            return res.send({
                type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function handleGetCurrencyResponse(charGeneralId, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const charGeneralData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(charGeneralId);
            const charGeneral = charGeneralData.rows[0];
            let content = "";
            content += `**Currency**`;
            content += `\n**Copper:** ${charGeneral.copper}`;
            content += `\n**Silver:** ${charGeneral.silver}`;
            content += `\n**Electrum:** ${charGeneral.electrum}`;
            content += `\n**Gold:** ${charGeneral.gold}`;
            content += `\n**Platinum:** ${charGeneral.platinum}`;
            return res.send({
                type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function handleGetEquipmentResponse(charGeneralId, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const equipmentData = yield (0, _5eCharEquipment_1.get5eCharEquipmentsByGeneralQuery)(charGeneralId);
            let content = "";
            content += `**Equipment**`;
            equipmentData.rows.forEach((eq) => {
                if (!eq.title)
                    return;
                content += `\n**${eq.title}:** Quantity: ${eq.quantity}, Weight: ${eq.weight}`;
            });
            content += `\n\n**TOTAL WEIGHT:** ${(0, _5eCharUtils_1.calculateTotalEquipmentWeight)(equipmentData.rows)}`;
            return res.send({
                type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function handleGetDeathSavesResponse(charGeneralId, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const charGeneralData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(charGeneralId);
            const charGeneral = charGeneralData.rows[0];
            let content = "";
            content += `**Death Saves**`;
            content += `\n**Successes:** (${charGeneral.ds_success_1 ? "●" : "○"}) - (${charGeneral.ds_success_2 ? "●" : "○"}) - (${charGeneral.ds_success_3 ? "●" : "○"})`;
            content += `\n**Failures:** (${charGeneral.ds_failure_1 ? "●" : "○"}) - (${charGeneral.ds_failure_2 ? "●" : "○"}) - (${charGeneral.ds_failure_3 ? "●" : "○"})`;
            return res.send({
                type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function handleGetOtherProLangResponse(charGeneralId, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const otherProLangData = yield (0, _5eCharOtherProLang_1.get5eCharOtherProLangsByGeneralQuery)(charGeneralId);
            let content = "";
            content += `**Other Proficiencies & Languages**`;
            otherProLangData.rows.forEach((op) => {
                if (!op.type)
                    return;
                content += `\n**${op.type}:** ${op.proficiency}`;
            });
            return res.send({
                type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function handleGetSkillsResponse(charGeneralId, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const charGeneralData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(charGeneralId);
            const charGeneral = charGeneralData.rows[0];
            const proData = yield (0, _5eCharPro_1.get5eCharProByGeneralQuery)(charGeneralId);
            const proficiencies = proData.rows[0];
            let content = "";
            content += `**Skills**`;
            content += `\n(${proficiencies.acrobatics ? "●" : "○"}) ${proficiencies.acrobatics
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.dexterity) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.dexterity)} **Acrobatics (dex)**`;
            content += `\n(${proficiencies.animal_handling ? "●" : "○"}) ${proficiencies.animal_handling
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom)} **Animal Handling (wis)**`;
            content += `\n(${proficiencies.arcana ? "●" : "○"}) ${proficiencies.arcana
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence)} **Arcana (int)**`;
            content += `\n(${proficiencies.athletics ? "●" : "○"}) ${proficiencies.athletics
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.strength) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.strength)} **Athletics (str)**`;
            content += `\n(${proficiencies.deception ? "●" : "○"}) ${proficiencies.deception
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.charisma) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.charisma)} **Deception (cha)**`;
            content += `\n(${proficiencies.history ? "●" : "○"}) ${proficiencies.history
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence)} **History (int)**`;
            content += `\n(${proficiencies.insight ? "●" : "○"}) ${proficiencies.insight
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom)} **Insight (wis)**`;
            content += `\n(${proficiencies.intimidation ? "●" : "○"}) ${proficiencies.intimidation
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.charisma) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.charisma)} **Intimidation (cha)**`;
            content += `\n(${proficiencies.investigation ? "●" : "○"}) ${proficiencies.investigation
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence)} **Investigation (int)**`;
            content += `\n(${proficiencies.medicine ? "●" : "○"}) ${proficiencies.medicine
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom)} **nature (wis)**`;
            content += `\n(${proficiencies.nature ? "●" : "○"}) ${proficiencies.nature
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence)} **Nature (int)**`;
            content += `\n(${proficiencies.perception ? "●" : "○"}) ${proficiencies.perception
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom)} **Perception (wis)**`;
            content += `\n(${proficiencies.performance ? "●" : "○"}) ${proficiencies.performance
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.charisma) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.charisma)} **Performance (cha)**`;
            content += `\n(${proficiencies.persuasion ? "●" : "○"}) ${proficiencies.persuasion
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.charisma) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.charisma)} **Persuasion (cha)**`;
            content += `\n(${proficiencies.religion ? "●" : "○"}) ${proficiencies.religion
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence)} **Religion (int)**`;
            content += `\n(${proficiencies.sleight_of_hand ? "●" : "○"}) ${proficiencies.sleight_of_hand
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.dexterity) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.dexterity)} **Sleight of Hand (dex)**`;
            content += `\n(${proficiencies.stealth ? "●" : "○"}) ${proficiencies.stealth
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.dexterity) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.dexterity)} **Stealth (dex)**`;
            content += `\n(${proficiencies.survival ? "●" : "○"}) ${proficiencies.survival
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom)} **Survival (wis)**`;
            return res.send({
                type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function handleGetSavingThrowsResponse(charGeneralId, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const charGeneralData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(charGeneralId);
            const charGeneral = charGeneralData.rows[0];
            const proData = yield (0, _5eCharPro_1.get5eCharProByGeneralQuery)(charGeneralId);
            const proficiencies = proData.rows[0];
            let content = "";
            content += `**Saving Throws**`;
            content += `\n**STR**(${proficiencies.sv_str ? "●" : "○"}) - ${proficiencies.sv_str
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.strength) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.strength)}`;
            content += `\n**DEX**(${proficiencies.sv_dex ? "●" : "○"}) - ${proficiencies.sv_dex
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.dexterity) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.dexterity)}`;
            content += `\n**CON**(${proficiencies.sv_con ? "●" : "○"}) - ${proficiencies.sv_con
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.constitution) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.constitution)}`;
            content += `\n**CON**(${proficiencies.sv_int ? "●" : "○"}) - ${proficiencies.sv_int
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence)}`;
            content += `\n**CON**(${proficiencies.sv_wis ? "●" : "○"}) - ${proficiencies.sv_wis
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom)}`;
            content += `\n**CON**(${proficiencies.sv_char ? "●" : "○"}) - ${proficiencies.sv_char
                ? (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.charisma) +
                    (0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)
                : (0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.charisma)}`;
            return res.send({
                type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function handleGetGeneralInfoResponse(charGeneralId, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const charGeneralData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(charGeneralId);
            const charGeneral = charGeneralData.rows[0];
            const proData = yield (0, _5eCharPro_1.get5eCharProByGeneralQuery)(charGeneralId);
            const proficiencies = proData.rows[0];
            const spellInfoData = yield (0, _5eCharSpellSlots_1.get5eCharSpellSlotInfoQuery)(charGeneralId);
            const spellInfo = spellInfoData.rows[0];
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
            content += `\n**HP:** ${charGeneral.current_hp + charGeneral.temp_hp} / ${charGeneral.max_hp}`;
            content += `\n**STR:** ${charGeneral.strength} (${(0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.strength)})`;
            content += `\n**DEX:** ${charGeneral.dexterity} (${(0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.dexterity)})`;
            content += `\n**CON:** ${charGeneral.constitution} (${(0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.constitution)})`;
            content += `\n**INT:** ${charGeneral.intelligence} (${(0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.intelligence)})`;
            content += `\n**WIS:** ${charGeneral.wisdom} (${(0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.wisdom)})`;
            content += `\n**CHA:** ${charGeneral.charisma} (${(0, _5eCharUtils_1.calculateAbilityScoreModifier)(charGeneral.charisma)})`;
            content += `\n**Proficiency Bonus:** ${(0, _5eCharUtils_1.calculateProBonus)(charGeneral.level)}`;
            content += `\n**Passive Perception:** ${(0, _5eCharUtils_1.calculatePassivePerception)(charGeneral.wisdom, charGeneral.wisdom_mod, proficiencies.perception, charGeneral.level)}`;
            content += `\n**Spell Save DC:** ${(0, _5eCharUtils_1.calculateSpellSaveDC)((0, _5eCharUtils_1.getAbilityScoreFromSpellCastingAbilityOrNull)(spellInfo.spell_casting_ability, charGeneral), charGeneral.level)}`;
            content += `\n**Spell Attack Bonus:** ${(0, _5eCharUtils_1.calculateSpellAttackBonus)((0, _5eCharUtils_1.getAbilityScoreFromSpellCastingAbilityOrNull)(spellInfo.spell_casting_ability, charGeneral), charGeneral.level)}`;
            if (charGeneral.class_resource &&
                charGeneral.class_resource_total &&
                charGeneral.class_resource_title) {
                content += `\n**Class Resource (${charGeneral.class_resource_title}):** ${charGeneral.class_resource} / ${charGeneral.class_resource_total}`;
            }
            if (charGeneral.other_resource &&
                charGeneral.other_resource_total &&
                charGeneral.other_resource_title) {
                content += `\n**Other Resource (${charGeneral.other_resource_title}):** ${charGeneral.other_resource} / ${charGeneral.other_resource_total}`;
            }
            return res.send({
                type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function handleGetCommand(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const discordUserId = req.body.member.user.id;
            const characterSheetIndex = req.body.data.options[0].options[0].value;
            const detailsOptionSelect = req.body.data.options[0].options[1].value;
            const redisData = yield socketUsers_1.redisClient.hGet("bot_character_sheets", discordUserId);
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
                }
                else {
                    return res.send({
                        type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: "ERROR: This ID does not match any character sheet currently registered",
                        },
                    });
                }
            }
            else {
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "ERROR: You do not have any character sheets registered",
                    },
                });
            }
        }
        catch (err) {
            throw err;
        }
    });
}
function handleSpellsCommand(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const discordUserId = req.body.member.user.id;
            const characterSheetIndex = req.body.data.options[0].options[0].value;
            const detailsOptionSelect = req.body.data.options[0].options[1].value;
            const redisData = yield socketUsers_1.redisClient.hGet("bot_character_sheets", discordUserId);
            if (redisData) {
                const jsonRedisData = JSON.parse(redisData);
                const correctedIndex = parseInt(characterSheetIndex) - 1;
                if (jsonRedisData[correctedIndex]) {
                    const charGeneralId = jsonRedisData[correctedIndex];
                    const spellInfoData = yield (0, _5eCharSpellSlots_1.get5eCharSpellSlotInfosByGeneralQuery)(charGeneralId);
                    const spellInfo = spellInfoData.rows[0];
                    const spellsData = yield (0, _5eCharSpells_1.get5eCharSpellsByTypeQuery)(charGeneralId, (0, _5eCharUtils_1.getSpellQueryTitleByOption)(detailsOptionSelect));
                    let totalCharCount = 0;
                    const embeds = [];
                    for (var spell of spellsData.rows) {
                        let description = "";
                        if (detailsOptionSelect !== "cantrips") {
                            description += `\n**Spell Slots:** ${(0, _5eCharUtils_1.getSpellSlotExpendedByOption)(detailsOptionSelect, spellInfo)} / ${(0, _5eCharUtils_1.getSpellSlotTotalByOption)(detailsOptionSelect, spellInfo)}`;
                        }
                        description += `\n**Casting Time:** ${spell.casting_time}`;
                        description += `\n**Duration:** ${spell.duration}`;
                        description += `\n**Range:** ${spell.range}`;
                        description += `\n**Damage Type:** ${spell.damage_type}`;
                        description += `\n**Components:** ${spell.components}`;
                        description += `\n**Description:** ${spell.description}`;
                        if (spell.title && spell.title.length)
                            totalCharCount += spell.title.length;
                        if (spell.description && spell.description.length)
                            totalCharCount += spell.description.length;
                        if (totalCharCount > 6000 || embeds.length >= 10) {
                            break;
                        }
                        embeds.push({
                            title: spell.title,
                            description,
                        });
                    }
                    return res.send({
                        type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `**${(0, utils_1.toTitleCase)(detailsOptionSelect.replace("-", " "))}**`,
                            embeds,
                        },
                    });
                }
                else {
                    return res.send({
                        type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: "ERROR: This ID does not match any character sheet currently registered",
                        },
                    });
                }
            }
            else {
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "ERROR: You do not have any character sheets registered",
                    },
                });
            }
        }
        catch (err) {
            throw err;
        }
    });
}
function characterSheetBotCommandResponse(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
        }
        catch (err) {
            throw err;
        }
    });
}
exports.characterSheetBotCommandResponse = characterSheetBotCommandResponse;
