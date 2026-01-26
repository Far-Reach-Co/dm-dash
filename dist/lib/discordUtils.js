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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordRequest = DiscordRequest;
const node_fetch_1 = __importDefault(require("node-fetch"));
function DiscordRequest(endpoint, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://discord.com/api/v10/${endpoint}`;
        const processedBody = options.body ? JSON.stringify(options.body) : undefined;
        const headers = Object.assign({ Authorization: `Bot ${process.env.DISCORD_TOKEN}`, "Content-Type": "application/json; charset=UTF-8", "User-Agent": "5e-bot (https://5ebot.com), 1.0.2)" }, options.headers);
        const res = yield (0, node_fetch_1.default)(url, Object.assign(Object.assign({}, options), { body: processedBody, headers }));
        if (!res.ok) {
            const data = yield res.json();
            throw new Error(JSON.stringify(data));
        }
        return yield res.json();
    });
}
