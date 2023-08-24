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
exports.userLeave = exports.getTableUsers = exports.getCurrentUser = exports.userJoin = exports.redisClient = void 0;
const redis_1 = require("redis");
exports.redisClient = (0, redis_1.createClient)();
exports.redisClient.connect();
exports.redisClient.on("error", (err) => console.log("Redis Client Error", err));
function userJoin(id, username, table) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = { id, username, table };
        yield exports.redisClient.hSet("users", id, JSON.stringify(user));
        return user;
    });
}
exports.userJoin = userJoin;
function getCurrentUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const userStr = yield exports.redisClient.hGet("users", id);
        if (!userStr) {
            return null;
        }
        return JSON.parse(userStr);
    });
}
exports.getCurrentUser = getCurrentUser;
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
exports.userLeave = userLeave;
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
exports.getTableUsers = getTableUsers;
