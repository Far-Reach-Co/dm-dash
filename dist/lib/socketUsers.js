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
exports.redisClient = void 0;
exports.userJoin = userJoin;
exports.getCurrentUser = getCurrentUser;
exports.getTableUsers = getTableUsers;
exports.userLeave = userLeave;
exports.getChatLog = getChatLog;
exports.appendMessageToChatLog = appendMessageToChatLog;
const redis_1 = require("redis");
exports.redisClient = (0, redis_1.createClient)();
exports.redisClient.connect();
exports.redisClient.on("error", (err) => console.log("Redis Client Error", err));
exports.redisClient.del("users");
function userJoin(id, username, table) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = { id, username, table };
        yield exports.redisClient.hSet("users", id, JSON.stringify(user));
        return user;
    });
}
function getCurrentUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const userStr = yield exports.redisClient.hGet("users", id);
        if (!userStr) {
            return null;
        }
        return JSON.parse(userStr);
    });
}
function userLeave(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const userStr = yield exports.redisClient.hGet("users", id);
        if (!userStr) {
            return null;
        }
        yield exports.redisClient.hDel("users", id);
        return JSON.parse(userStr);
    });
}
function getTableUsers(table) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield exports.redisClient.hGetAll("users");
        if (!users)
            return [];
        return Object.values(users)
            .map((userStr) => JSON.parse(userStr))
            .filter((user) => user.table === table);
    });
}
function getChatLog(table) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatLogKey = `${table}-table-chatlog`;
        const messages = yield exports.redisClient.lRange(chatLogKey, 0, -1);
        return messages.map((message) => JSON.parse(message));
    });
}
function appendMessageToChatLog(table, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatLogKey = `${table}-table-chatlog`;
        yield exports.redisClient.rPush(chatLogKey, JSON.stringify({
            userId: message.userId,
            username: message.username,
            content: message.content,
            timestamp: message.timestamp,
        }));
        yield exports.redisClient.lTrim(chatLogKey, -100, -1);
    });
}
