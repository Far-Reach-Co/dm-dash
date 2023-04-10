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
var _a = require("../queries/characters.js"), addCharacterQuery = _a.addCharacterQuery, getCharacterQuery = _a.getCharacterQuery, getCharactersQuery = _a.getCharactersQuery, getCharactersWithFilterQuery = _a.getCharactersWithFilterQuery, getCharactersWithKeywordQuery = _a.getCharactersWithKeywordQuery, getCharactersWithKeywordAndFilterQuery = _a.getCharactersWithKeywordAndFilterQuery, getCharactersByLocationQuery = _a.getCharactersByLocationQuery, removeCharacterQuery = _a.removeCharacterQuery, editCharacterQuery = _a.editCharacterQuery;
var addEventQuery = require("../queries/events.js").addEventQuery;
var _b = require("../queries/images.js"), getImageQuery = _b.getImageQuery, removeImageQuery = _b.removeImageQuery;
var getLocationQuery = require("../queries/locations.js").getLocationQuery;
var _c = require("../queries/projects.js"), getProjectQuery = _c.getProjectQuery, editProjectQuery = _c.editProjectQuery;
var getProjectUserByUserAndProjectQuery = require("../queries/projectUsers.js").getProjectUserByUserAndProjectQuery;
var removeFile = require("./s3.js").removeFile;
function addCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var projectData, project, projectUser, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getProjectQuery(req.body.project_id)];
                case 1:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 3];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 2:
                    projectUser = _a.sent();
                    if (!projectUser)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 3;
                case 3: return [4, addCharacterQuery(req.body)];
                case 4:
                    data = _a.sent();
                    res.status(201).json(data.rows[0]);
                    return [3, 6];
                case 5:
                    err_1 = _a.sent();
                    next(err_1);
                    return [3, 6];
                case 6: return [2];
            }
        });
    });
}
function getCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var characterData, character, projectData, project, projectUser, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getCharacterQuery(req.params.id)];
                case 1:
                    characterData = _a.sent();
                    character = characterData.rows[0];
                    return [4, getProjectQuery(character.project_id)];
                case 2:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 4];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 3:
                    projectUser = _a.sent();
                    if (!projectUser)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 4;
                case 4:
                    res.send(character);
                    return [3, 6];
                case 5:
                    err_2 = _a.sent();
                    next(err_2);
                    return [3, 6];
                case 6: return [2];
            }
        });
    });
}
function getCharacters(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var projectData, project, projectUser, data, err_3, data, err_4, data, err_5, data, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getProjectQuery(req.params.project_id)];
                case 1:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (project.user_id !== req.user.id) {
                        projectUser = getProjectUserByUserAndProjectQuery(req.user.id, project.id);
                        if (!projectUser)
                            throw { status: 403, message: "Forbidden" };
                    }
                    if (!(req.params.keyword && req.params.filter)) return [3, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4, getCharactersWithKeywordAndFilterQuery({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset,
                            keyword: req.params.keyword,
                            filter: req.params.filter
                        })];
                case 3:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 5];
                case 4:
                    err_3 = _a.sent();
                    next(err_3);
                    return [3, 5];
                case 5: return [3, 19];
                case 6:
                    if (!(req.params.keyword && !req.params.filter)) return [3, 11];
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4, getCharactersWithKeywordQuery({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset,
                            keyword: req.params.keyword
                        })];
                case 8:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 10];
                case 9:
                    err_4 = _a.sent();
                    next(err_4);
                    return [3, 10];
                case 10: return [3, 19];
                case 11:
                    if (!(req.params.filter && !req.params.keyword)) return [3, 16];
                    _a.label = 12;
                case 12:
                    _a.trys.push([12, 14, , 15]);
                    return [4, getCharactersWithFilterQuery({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset,
                            filter: req.params.filter
                        })];
                case 13:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 15];
                case 14:
                    err_5 = _a.sent();
                    next(err_5);
                    return [3, 15];
                case 15: return [3, 19];
                case 16:
                    _a.trys.push([16, 18, , 19]);
                    return [4, getCharactersQuery({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset
                        })];
                case 17:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 19];
                case 18:
                    err_6 = _a.sent();
                    next(err_6);
                    return [3, 19];
                case 19: return [2];
            }
        });
    });
}
function getCharactersByLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var locationData, location_1, projectData, project, projectUser, data, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getLocationQuery(req.params.location_id)];
                case 1:
                    locationData = _a.sent();
                    location_1 = locationData.rows[0];
                    return [4, getProjectQuery(location_1.project_id)];
                case 2:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 4];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 3:
                    projectUser = _a.sent();
                    if (!projectUser)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 4;
                case 4: return [4, getCharactersByLocationQuery(req.params.location_id)];
                case 5:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 7];
                case 6:
                    err_7 = _a.sent();
                    next(err_7);
                    return [3, 7];
                case 7: return [2];
            }
        });
    });
}
function removeCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var characterData, character, projectData, project, projectUser, imageData, image, newCalculatedData, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 12]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getCharacterQuery(req.params.id)];
                case 1:
                    characterData = _a.sent();
                    character = characterData.rows[0];
                    return [4, getProjectQuery(character.project_id)];
                case 2:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 4];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 3:
                    projectUser = _a.sent();
                    if (projectUser.rows &&
                        projectUser.rows.length &&
                        !projectUser.rows[0].is_editor)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 4;
                case 4: return [4, removeCharacterQuery(req.params.id)];
                case 5:
                    _a.sent();
                    res.status(204).send();
                    if (!character.image_id) return [3, 10];
                    return [4, getImageQuery(character.image_id)];
                case 6:
                    imageData = _a.sent();
                    image = imageData.rows[0];
                    return [4, removeFile("wyrld/images", image)];
                case 7:
                    _a.sent();
                    return [4, removeImageQuery(image.id)];
                case 8:
                    _a.sent();
                    newCalculatedData = project.used_data_in_bytes - image.size;
                    return [4, editProjectQuery(project.id, {
                            used_data_in_bytes: newCalculatedData
                        })];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [3, 12];
                case 11:
                    err_8 = _a.sent();
                    next(err_8);
                    return [3, 12];
                case 12: return [2];
            }
        });
    });
}
function editCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var characterData, character, projectData, project, projectUser, data, locationData, location_2, title, previousLocationData, previousLocation, err_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getCharacterQuery(req.params.id)];
                case 1:
                    characterData = _a.sent();
                    character = characterData.rows[0];
                    return [4, getProjectQuery(character.project_id)];
                case 2:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 4];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 3:
                    projectUser = _a.sent();
                    if (projectUser.rows &&
                        projectUser.rows.length &&
                        !projectUser.rows[0].is_editor)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 4;
                case 4: return [4, editCharacterQuery(req.params.id, req.body)];
                case 5:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
                    if (!req.body.location_id) return [3, 11];
                    return [4, getLocationQuery(req.body.location_id)];
                case 6:
                    locationData = _a.sent();
                    location_2 = locationData.rows[0];
                    title = "".concat(character.title, " moved to ").concat(location_2.title);
                    if (!character.location_id) return [3, 9];
                    return [4, getLocationQuery(character.location_id)];
                case 7:
                    previousLocationData = _a.sent();
                    return [4, previousLocationData.rows[0]];
                case 8:
                    previousLocation = _a.sent();
                    title += " from ".concat(previousLocation.title);
                    _a.label = 9;
                case 9: return [4, addEventQuery({
                        project_id: project.id,
                        title: title,
                        character_id: character.id,
                        location_id: location_2.id
                    })];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [3, 13];
                case 12:
                    err_9 = _a.sent();
                    next(err_9);
                    return [3, 13];
                case 13: return [2];
            }
        });
    });
}
module.exports = {
    getCharacter: getCharacter,
    getCharacters: getCharacters,
    getCharactersWithFilterQuery: getCharactersWithFilterQuery,
    getCharactersWithKeywordQuery: getCharactersWithKeywordQuery,
    getCharactersWithKeywordAndFilterQuery: getCharactersWithKeywordAndFilterQuery,
    getCharactersByLocation: getCharactersByLocation,
    addCharacter: addCharacter,
    removeCharacter: removeCharacter,
    editCharacter: editCharacter
};
