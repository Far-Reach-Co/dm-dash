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
exports.__esModule = true;
exports.editLore = exports.removeLore = exports.addLore = exports.getLores = exports.getLore = void 0;
var lores_js_1 = require("../queries/lores.js");
var projects_js_1 = require("../queries/projects.js");
var s3_js_1 = require("./s3.js");
var images_js_1 = require("../queries/images.js");
function addLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, lores_js_1.addLoreQuery)(req.body)];
                case 1:
                    data = _a.sent();
                    res.status(201).json(data.rows[0]);
                    return [3, 3];
                case 2:
                    err_1 = _a.sent();
                    next(err_1);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.addLore = addLore;
function getLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var loreData, lore, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, lores_js_1.getLoreQuery)(req.params.id)];
                case 1:
                    loreData = _a.sent();
                    lore = loreData.rows[0];
                    res.send(lore);
                    return [3, 3];
                case 2:
                    err_2 = _a.sent();
                    next(err_2);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.getLore = getLore;
function getLores(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_3, data, err_4, data, err_5, data, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(req.params.keyword && req.params.filter)) return [3, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, (0, lores_js_1.getLoresWithKeywordAndFilterQuery)({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset,
                            keyword: req.params.keyword,
                            filter: req.params.filter
                        })];
                case 2:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 4];
                case 3:
                    err_3 = _a.sent();
                    next(err_3);
                    return [3, 4];
                case 4: return [3, 18];
                case 5:
                    if (!(req.params.keyword && !req.params.filter)) return [3, 10];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4, (0, lores_js_1.getLoresWithKeywordQuery)({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset,
                            keyword: req.params.keyword
                        })];
                case 7:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 9];
                case 8:
                    err_4 = _a.sent();
                    next(err_4);
                    return [3, 9];
                case 9: return [3, 18];
                case 10:
                    if (!(req.params.filter && !req.params.keyword)) return [3, 15];
                    _a.label = 11;
                case 11:
                    _a.trys.push([11, 13, , 14]);
                    return [4, (0, lores_js_1.getLoresWithFilterQuery)({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset,
                            filter: req.params.filter
                        })];
                case 12:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 14];
                case 13:
                    err_5 = _a.sent();
                    next(err_5);
                    return [3, 14];
                case 14: return [3, 18];
                case 15:
                    _a.trys.push([15, 17, , 18]);
                    return [4, (0, lores_js_1.getLoresQuery)({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset
                        })];
                case 16:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 18];
                case 17:
                    err_6 = _a.sent();
                    next(err_6);
                    return [3, 18];
                case 18: return [2];
            }
        });
    });
}
exports.getLores = getLores;
function removeLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var LoreData, Lore, projectData, project, data, imageData, image, newCalculatedData, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    return [4, (0, lores_js_1.getLoreQuery)(req.params.id)];
                case 1:
                    LoreData = _a.sent();
                    Lore = LoreData.rows[0];
                    return [4, (0, projects_js_1.getProjectQuery)(Lore.project_id)];
                case 2:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    return [4, (0, lores_js_1.removeLoreQuery)(req.params.id)];
                case 3:
                    data = _a.sent();
                    res.status(204).send();
                    if (!Lore.image_id) return [3, 8];
                    return [4, (0, images_js_1.getImageQuery)(Lore.image_id)];
                case 4:
                    imageData = _a.sent();
                    image = imageData.rows[0];
                    return [4, (0, s3_js_1.removeFile)("wyrld/images", image)];
                case 5:
                    _a.sent();
                    return [4, (0, images_js_1.removeImageQuery)(image.id)];
                case 6:
                    _a.sent();
                    newCalculatedData = project.used_data_in_bytes - image.size;
                    return [4, (0, projects_js_1.editProjectQuery)(project.id, {
                            used_data_in_bytes: newCalculatedData
                        })];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [3, 10];
                case 9:
                    err_7 = _a.sent();
                    next(err_7);
                    return [3, 10];
                case 10: return [2];
            }
        });
    });
}
exports.removeLore = removeLore;
function editLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, lores_js_1.editLoreQuery)(req.params.id, req.body)];
                case 1:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
                    return [3, 3];
                case 2:
                    err_8 = _a.sent();
                    next(err_8);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.editLore = editLore;
