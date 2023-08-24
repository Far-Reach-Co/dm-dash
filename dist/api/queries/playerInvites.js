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
exports.removePlayerInviteQuery = exports.getPlayerInviteByPlayerQuery = exports.getPlayerInviteByUUIDQuery = exports.getPlayerInviteQuery = exports.addPlayerInviteQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addPlayerInviteQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."PlayerInvite" (uuid, player_id) values($1,$2) returning *`,
            values: [
                data.uuid,
                data.player_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addPlayerInviteQuery = addPlayerInviteQuery;
function getPlayerInviteQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."PlayerInvite" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getPlayerInviteQuery = getPlayerInviteQuery;
function getPlayerInviteByPlayerQuery(playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."PlayerInvite" where player_id = $1`,
            values: [playerId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getPlayerInviteByPlayerQuery = getPlayerInviteByPlayerQuery;
function getPlayerInviteByUUIDQuery(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."PlayerInvite" where uuid = $1`,
            values: [uuid]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getPlayerInviteByUUIDQuery = getPlayerInviteByUUIDQuery;
function removePlayerInviteQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."PlayerInvite" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removePlayerInviteQuery = removePlayerInviteQuery;
