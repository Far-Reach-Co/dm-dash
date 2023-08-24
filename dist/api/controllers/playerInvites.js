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
exports.removePlayerInvite = exports.addPlayerInvite = exports.getPlayerInviteByPlayer = exports.getPlayerInviteByUUID = void 0;
const playerInvites_js_1 = require("../queries/playerInvites.js");
const uuid_1 = require("uuid");
function addPlayerInvite(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = (0, uuid_1.v4)();
        req.body.uuid = uuid;
        try {
            const data = yield (0, playerInvites_js_1.addPlayerInviteQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addPlayerInvite = addPlayerInvite;
function getPlayerInviteByUUID(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, playerInvites_js_1.getPlayerInviteByUUIDQuery)(req.params.uuid);
            res.send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getPlayerInviteByUUID = getPlayerInviteByUUID;
function getPlayerInviteByPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, playerInvites_js_1.getPlayerInviteByPlayerQuery)(req.params.player_id);
            res.send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getPlayerInviteByPlayer = getPlayerInviteByPlayer;
function removePlayerInvite(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, playerInvites_js_1.removePlayerInviteQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removePlayerInvite = removePlayerInvite;
