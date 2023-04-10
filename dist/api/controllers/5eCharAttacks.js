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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var get5eCharGeneralQuery = require("../queries/5eCharGeneral.js").get5eCharGeneralQuery;
var _a = require("../queries/5eCharAttacks.js"), add5eCharAttackQuery = _a.add5eCharAttackQuery, get5eCharAttackQuery = _a.get5eCharAttackQuery, get5eCharAttacksByGeneralQuery = _a.get5eCharAttacksByGeneralQuery, remove5eCharAttackQuery = _a.remove5eCharAttackQuery, edit5eCharAttackQuery = _a.edit5eCharAttackQuery;
var getProjectPlayersByPlayerQuery = require("../queries/projectPlayers.js").getProjectPlayersByPlayerQuery;
var getProjectQuery = require("../queries/projects.js").getProjectQuery;
function add5eCharAttack(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var generalsData, general, projectPlayersData, projectPlayer, projectData, project, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, get5eCharGeneralQuery(req.body.general_id)];
                case 1:
                    generalsData = _a.sent();
                    general = generalsData.rows[0];
                    if (!(general.user_id !== req.user.id)) return [3, 5];
                    return [4, getProjectPlayersByPlayerQuery(general.id)];
                case 2:
                    projectPlayersData = _a.sent();
                    if (!projectPlayersData.rows.length) return [3, 4];
                    projectPlayer = projectPlayersData.rows[0];
                    return [4, getProjectQuery(projectPlayer.project_id)];
                case 3:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (project.user_id !== req.user.id)
                        throw { status: 403, message: "Forbidden" };
                    return [3, 5];
                case 4: throw { status: 403, message: "Forbidden" };
                case 5: return [4, add5eCharAttackQuery(req.body)];
                case 6:
                    data = _a.sent();
                    res.status(201).json(data.rows[0]);
                    return [3, 8];
                case 7:
                    err_1 = _a.sent();
                    next(err_1);
                    return [3, 8];
                case 8: return [2];
            }
        });
    });
}
function get5eCharAttacksByGeneral(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var generalsData, general, projectPlayersData, projectPlayer, projectData, project, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, get5eCharGeneralQuery(req.params.general_id)];
                case 1:
                    generalsData = _a.sent();
                    general = generalsData.rows[0];
                    if (!(general.user_id !== req.user.id)) return [3, 5];
                    return [4, getProjectPlayersByPlayerQuery(general.id)];
                case 2:
                    projectPlayersData = _a.sent();
                    if (!projectPlayersData.rows.length) return [3, 4];
                    projectPlayer = projectPlayersData.rows[0];
                    return [4, getProjectQuery(projectPlayer.project_id)];
                case 3:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (project.user_id !== req.user.id)
                        throw { status: 403, message: "Forbidden" };
                    return [3, 5];
                case 4: throw { status: 403, message: "Forbidden" };
                case 5: return [4, get5eCharAttacksByGeneralQuery(req.params.general_id)];
                case 6:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 8];
                case 7:
                    err_2 = _a.sent();
                    next(err_2);
                    return [3, 8];
                case 8: return [2];
            }
        });
    });
}
function remove5eCharAttack(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var otherProLangData, otherProLang, generalsData, general, projectPlayersData, projectPlayer, projectData, project, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, get5eCharAttackQuery(req.params.id)];
                case 1:
                    otherProLangData = _a.sent();
                    otherProLang = otherProLangData.rows[0];
                    return [4, get5eCharGeneralQuery(otherProLang.general_id)];
                case 2:
                    generalsData = _a.sent();
                    general = generalsData.rows[0];
                    if (!(general.user_id !== req.user.id)) return [3, 6];
                    return [4, getProjectPlayersByPlayerQuery(general.id)];
                case 3:
                    projectPlayersData = _a.sent();
                    if (!projectPlayersData.rows.length) return [3, 5];
                    projectPlayer = projectPlayersData.rows[0];
                    return [4, getProjectQuery(projectPlayer.project_id)];
                case 4:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (project.user_id !== req.user.id)
                        throw { status: 403, message: "Forbidden" };
                    return [3, 6];
                case 5: throw { status: 403, message: "Forbidden" };
                case 6: return [4, remove5eCharAttackQuery(req.params.id)];
                case 7:
                    _a.sent();
                    res.status(204).send();
                    return [3, 9];
                case 8:
                    err_3 = _a.sent();
                    next(err_3);
                    return [3, 9];
                case 9: return [2];
            }
        });
    });
}
function edit5eCharAttack(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var otherProLangData, otherProLang, generalsData, general, projectPlayersData, projectPlayer, projectData, project, data, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, get5eCharAttackQuery(req.params.id)];
                case 1:
                    otherProLangData = _a.sent();
                    otherProLang = otherProLangData.rows[0];
                    return [4, get5eCharGeneralQuery(otherProLang.general_id)];
                case 2:
                    generalsData = _a.sent();
                    general = generalsData.rows[0];
                    if (!(general.user_id !== req.user.id)) return [3, 6];
                    return [4, getProjectPlayersByPlayerQuery(general.id)];
                case 3:
                    projectPlayersData = _a.sent();
                    if (!projectPlayersData.rows.length) return [3, 5];
                    projectPlayer = projectPlayersData.rows[0];
                    return [4, getProjectQuery(projectPlayer.project_id)];
                case 4:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (project.user_id !== req.user.id)
                        throw { status: 403, message: "Forbidden" };
                    return [3, 6];
                case 5: throw { status: 403, message: "Forbidden" };
                case 6: return [4, edit5eCharAttackQuery(req.params.id, req.body)];
                case 7:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
                    return [3, 9];
                case 8:
                    err_4 = _a.sent();
                    next(err_4);
                    return [3, 9];
                case 9: return [2];
            }
        });
    });
}
module.exports = {
    get5eCharAttacksByGeneral: get5eCharAttacksByGeneral,
    add5eCharAttack: add5eCharAttack,
    remove5eCharAttack: remove5eCharAttack,
    edit5eCharAttack: edit5eCharAttack
};
