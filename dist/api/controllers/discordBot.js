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
exports.interactionsController = exports.createCommands = exports.deleteCommand = exports.getCommands = void 0;
const discordUtils_1 = require("../../lib/discordUtils");
const discordCommands_1 = require("../../lib/discordCommands");
const discord_interactions_1 = require("discord-interactions");
const botChar_1 = require("./botChar");
const appId = process.env.BOT_APP_ID;
const globalEndpoint = `applications/${appId}/commands`;
function getCommands(_req, res, _next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const discordRes = yield (0, discordUtils_1.DiscordRequest)(globalEndpoint, {
                method: "GET",
            });
            const result = yield discordRes;
            return res.send(result);
        }
        catch (err) {
            return res.send({ message: "Failed to get slash commands", error: err });
        }
    });
}
exports.getCommands = getCommands;
function deleteCommand(req, res, _next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const discordRes = yield (0, discordUtils_1.DiscordRequest)(`${globalEndpoint}/${req.params.id}`, {
                method: "DELETE",
            });
            const resJson = yield discordRes;
            return res.send({ message: "deleted", details: resJson });
        }
        catch (err) {
            return res.send({ message: "Failed to get delete command", error: err });
        }
    });
}
exports.deleteCommand = deleteCommand;
function createCommands(_req, res, _next) {
    return __awaiter(this, void 0, void 0, function* () {
        const slashCommandsList = [
            "character_sheet",
        ];
        const responseList = [];
        yield Promise.all(slashCommandsList.map((slashCommandName) => __awaiter(this, void 0, void 0, function* () {
            const commandBody = yield (0, discordCommands_1.default)(slashCommandName);
            try {
                if (!commandBody)
                    throw { message: "missing command body" };
                const res = yield (0, discordUtils_1.DiscordRequest)(globalEndpoint, {
                    method: "POST",
                    body: commandBody,
                });
                responseList.push({ slashCommandName, res, message: "success" });
            }
            catch (err) {
                console.log(err);
                responseList.push({ slashCommandName, error: err, message: "Failed" });
            }
        })));
        return res.send({ list: responseList });
    });
}
exports.createCommands = createCommands;
function interactionsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { type, data } = req.body;
            if (type === discord_interactions_1.InteractionType.PING) {
                return res.send({ type: discord_interactions_1.InteractionResponseType.PONG });
            }
            if (type === discord_interactions_1.InteractionType.APPLICATION_COMMAND) {
                switch (data.name) {
                    case "help":
                        return res.send({
                            type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                content: "Please visit this documentation site to better understand the usage of the commands",
                            },
                        });
                    case "cs":
                        return (0, botChar_1.characterSheetBotCommandResponse)(req, res);
                    default:
                        throw { message: "Missing command name" };
                }
            }
            if (type === discord_interactions_1.InteractionType.MESSAGE_COMPONENT) {
                return (0, botChar_1.characterSheetBotMessageResponse)(req, res);
            }
            else
                return;
        }
        catch (err) {
            console.log(err);
            return next(err);
        }
    });
}
exports.interactionsController = interactionsController;
