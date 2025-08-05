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
exports.editPlayerUser = exports.removePlayerUsersByPlayer = exports.removePlayerUserByUserAndPlayer = exports.removePlayerUser = exports.getPlayerUsersByPlayer = exports.getPlayerUserByUserAndPlayer = exports.addPlayerUser = void 0;
const _5eCharGeneral_js_1 = require("../queries/5eCharGeneral.js");
const playerUsers_js_1 = require("../queries/playerUsers.js");
const users_js_1 = require("../queries/users.js");
function addPlayerUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            req.body.user_id = req.session.user;
            const charData = yield (0, _5eCharGeneral_js_1.get5eCharGeneralQuery)(req.body.player_id);
            if (charData.rows[0].user_id == req.session.user) {
                throw { message: "User is owner" };
            }
            const data = yield (0, playerUsers_js_1.addPlayerUserQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addPlayerUser = addPlayerUser;
function getPlayerUserByUserAndPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const data = yield (0, playerUsers_js_1.getPlayerUserByUserAndPlayerQuery)(req.session.user, req.params.player_id);
            res.status(200).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getPlayerUserByUserAndPlayer = getPlayerUserByUserAndPlayer;
function getPlayerUsersByPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const PlayerUsersData = yield (0, playerUsers_js_1.getPlayerUsersByPlayerQuery)(req.params.player_id);
            const usersList = [];
            for (const PlayerUser of PlayerUsersData.rows) {
                const userData = yield (0, users_js_1.getUserByIdQuery)(PlayerUser.user_id);
                const user = userData.rows[0];
                user.player_user_id =
                    PlayerUser.id;
                user.is_editor =
                    PlayerUser.is_editor;
                usersList.push(user);
            }
            res.status(200).json(usersList);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getPlayerUsersByPlayer = getPlayerUsersByPlayer;
function removePlayerUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, playerUsers_js_1.removePlayerUserQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removePlayerUser = removePlayerUser;
function removePlayerUserByUserAndPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const playerUserData = yield (0, playerUsers_js_1.getPlayerUserByUserAndPlayerQuery)(req.session.user, req.params.player_id);
            yield (0, playerUsers_js_1.removePlayerUserQuery)(playerUserData.rows[0].id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removePlayerUserByUserAndPlayer = removePlayerUserByUserAndPlayer;
function removePlayerUsersByPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            yield (0, playerUsers_js_1.removePlayerUsersByPlayerQuery)(req.params.player_id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removePlayerUsersByPlayer = removePlayerUsersByPlayer;
function editPlayerUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, playerUsers_js_1.editPlayerUserQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editPlayerUser = editPlayerUser;
