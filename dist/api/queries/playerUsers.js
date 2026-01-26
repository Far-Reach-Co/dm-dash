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
exports.addPlayerUserQuery = addPlayerUserQuery;
exports.getPlayerUserQuery = getPlayerUserQuery;
exports.getPlayerUsersQuery = getPlayerUsersQuery;
exports.getPlayerUsersByPlayerQuery = getPlayerUsersByPlayerQuery;
exports.removePlayerUserQuery = removePlayerUserQuery;
exports.editPlayerUserQuery = editPlayerUserQuery;
exports.getPlayerUserByUserAndPlayerQuery = getPlayerUserByUserAndPlayerQuery;
exports.removePlayerUsersByPlayerQuery = removePlayerUsersByPlayerQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
function addPlayerUserQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."PlayerUser" (player_id, user_id) values($1,$2) returning *`,
            values: [
                data.player_id,
                data.user_id,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getPlayerUsersQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."PlayerUser" where user_id = $1`,
            values: [userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getPlayerUserByUserAndPlayerQuery(userId, playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."PlayerUser" where user_id = $1 and player_id = $2`,
            values: [userId, playerId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getPlayerUsersByPlayerQuery(playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."PlayerUser" where player_id = $1`,
            values: [playerId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getPlayerUserQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."PlayerUser" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function removePlayerUsersByPlayerQuery(playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."PlayerUser" where player_id = $1`,
            values: [playerId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function removePlayerUserQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."PlayerUser" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function editPlayerUserQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let edits = ``;
        let values = [];
        let iterator = 1;
        for (const [key, value] of Object.entries(data)) {
            edits += `${key} = $${iterator}, `;
            values.push(value);
            iterator++;
        }
        edits = edits.slice(0, -2);
        values.push(id);
        const query = {
            text: `update public."PlayerUser" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
