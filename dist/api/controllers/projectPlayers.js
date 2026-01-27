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
exports.addProjectPlayer = addProjectPlayer;
exports.getProjectPlayersByProject = getProjectPlayersByProject;
exports.getProjectPlayersByPlayer = getProjectPlayersByPlayer;
exports.removeProjectPlayer = removeProjectPlayer;
exports.editProjectPlayer = editProjectPlayer;
const projectPlayers_1 = require("../queries/projectPlayers");
const eventLogger_1 = require("../../lib/eventLogger");
function addProjectPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, projectPlayers_1.addProjectPlayerQuery)(req.body);
            const projectPlayer = data.rows[0];
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                projectId: req.body.project_id,
                eventType: eventLogger_1.EventType.PROJECT_PLAYER_CREATED,
                eventData: {
                    projectPlayerId: projectPlayer.id,
                    playerId: req.body.player_id,
                },
                req,
            });
            if (req.headers["hx-request"]) {
                res
                    .set("HX-Redirect", `/wyrld?id=${req.body.project_id}`)
                    .send("Character linked successfully.");
            }
            else {
                res.status(201).json(projectPlayer);
            }
        }
        catch (err) {
            next(err);
        }
    });
}
function getProjectPlayersByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const projectPlayerData = yield (0, projectPlayers_1.getProjectPlayersByProjectQuery)(req.params.project_id);
            res.status(200).json(projectPlayerData.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
function getProjectPlayersByPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const projectPlayerData = yield (0, projectPlayers_1.getProjectPlayersByPlayerQuery)(req.params.player_id);
            res.status(200).json(projectPlayerData.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
function removeProjectPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, projectPlayers_1.removeProjectPlayerQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
function editProjectPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, projectPlayers_1.editProjectPlayerQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
