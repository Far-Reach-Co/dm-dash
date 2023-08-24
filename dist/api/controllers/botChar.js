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
