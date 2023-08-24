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
exports.editProjectPlayer = exports.removeProjectPlayer = exports.getProjectPlayersByPlayer = exports.getProjectPlayersByProject = exports.addProjectPlayer = void 0;
const projectPlayers_1 = require("../queries/projectPlayers");
function addProjectPlayer(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, projectPlayers_1.addProjectPlayerQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addProjectPlayer = addProjectPlayer;
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
exports.getProjectPlayersByProject = getProjectPlayersByProject;
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
exports.getProjectPlayersByPlayer = getProjectPlayersByPlayer;
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
exports.removeProjectPlayer = removeProjectPlayer;
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
exports.editProjectPlayer = editProjectPlayer;
