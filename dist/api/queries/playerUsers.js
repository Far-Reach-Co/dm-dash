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
exports.removePlayerUsersByPlayerQuery = exports.getPlayerUserByUserAndPlayerQuery = exports.editPlayerUserQuery = exports.removePlayerUserQuery = exports.getPlayerUsersByPlayerQuery = exports.getPlayerUsersQuery = exports.getPlayerUserQuery = exports.addPlayerUserQuery = void 0;
const dbconfig_1 = require("../dbconfig");
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
exports.addPlayerUserQuery = addPlayerUserQuery;
function getPlayerUsersQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."PlayerUser" where user_id = $1`,
            values: [userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getPlayerUsersQuery = getPlayerUsersQuery;
function getPlayerUserByUserAndPlayerQuery(userId, playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."PlayerUser" where user_id = $1 and player_id = $2`,
            values: [userId, playerId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getPlayerUserByUserAndPlayerQuery = getPlayerUserByUserAndPlayerQuery;
function getPlayerUsersByPlayerQuery(playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."PlayerUser" where player_id = $1`,
            values: [playerId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getPlayerUsersByPlayerQuery = getPlayerUsersByPlayerQuery;
function getPlayerUserQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."PlayerUser" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getPlayerUserQuery = getPlayerUserQuery;
function removePlayerUsersByPlayerQuery(playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."PlayerUser" where player_id = $1`,
            values: [playerId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removePlayerUsersByPlayerQuery = removePlayerUsersByPlayerQuery;
function removePlayerUserQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."PlayerUser" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removePlayerUserQuery = removePlayerUserQuery;
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
exports.editPlayerUserQuery = editPlayerUserQuery;
