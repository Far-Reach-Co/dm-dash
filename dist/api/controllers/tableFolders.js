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
exports.editTableFolderTitle = exports.removeTableFolder = exports.addTableFolderByUser = exports.addTableFolderByProject = exports.getTableFoldersByUser = exports.getTableFoldersByProject = void 0;
var tableFolders_1 = require("../queries/tableFolders");
var tableImages_1 = require("../queries/tableImages");
function addTableFolderByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, tableFolders_1.addTableFolderByProjectQuery)(req.body)];
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
exports.addTableFolderByProject = addTableFolderByProject;
function addTableFolderByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!req.session.user)
                        throw { message: "User is not logged in" };
                    req.body.user_id = req.session.user;
                    return [4, (0, tableFolders_1.addTableFolderByUserQuery)(req.body)];
                case 1:
                    data = _a.sent();
                    res.status(201).json(data.rows[0]);
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
exports.addTableFolderByUser = addTableFolderByUser;
function getTableFoldersByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, tableFolders_1.getTableFoldersByProjectQuery)(req.params.project_id)];
                case 1:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 3];
                case 2:
                    err_3 = _a.sent();
                    next(err_3);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.getTableFoldersByProject = getTableFoldersByProject;
function getTableFoldersByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!req.session.user)
                        throw { message: "User is not logged in" };
                    return [4, (0, tableFolders_1.getTableFoldersByUserQuery)(req.session.user)];
                case 1:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 3];
                case 2:
                    err_4 = _a.sent();
                    next(err_4);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.getTableFoldersByUser = getTableFoldersByUser;
function removeTableFolder(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var folderData, folder, tableImages, _i, _a, tableImage, subFoldersData, _b, _c, subFolder, subFolderTableImages, _d, _e, subTableImage, err_5;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 18, , 19]);
                    return [4, (0, tableFolders_1.getTableFolderQuery)(req.params.id)];
                case 1:
                    folderData = _f.sent();
                    folder = folderData.rows[0];
                    return [4, (0, tableImages_1.getTableImagesByFolderQuery)(req.params.id)];
                case 2:
                    tableImages = _f.sent();
                    _i = 0, _a = tableImages.rows;
                    _f.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3, 6];
                    tableImage = _a[_i];
                    return [4, (0, tableImages_1.editTableImageQuery)(tableImage.id, {
                            folder_id: folder.parent_folder_id
                        })];
                case 4:
                    _f.sent();
                    _f.label = 5;
                case 5:
                    _i++;
                    return [3, 3];
                case 6: return [4, (0, tableFolders_1.getTableFoldersByParentQuery)(req.params.id)];
                case 7:
                    subFoldersData = _f.sent();
                    _b = 0, _c = subFoldersData.rows;
                    _f.label = 8;
                case 8:
                    if (!(_b < _c.length)) return [3, 16];
                    subFolder = _c[_b];
                    return [4, (0, tableImages_1.getTableImagesByFolderQuery)(subFolder.id)];
                case 9:
                    subFolderTableImages = _f.sent();
                    _d = 0, _e = subFolderTableImages.rows;
                    _f.label = 10;
                case 10:
                    if (!(_d < _e.length)) return [3, 13];
                    subTableImage = _e[_d];
                    return [4, (0, tableImages_1.editTableImageQuery)(subTableImage.id, {
                            folder_id: folder.parent_folder_id
                        })];
                case 11:
                    _f.sent();
                    _f.label = 12;
                case 12:
                    _d++;
                    return [3, 10];
                case 13: return [4, (0, tableFolders_1.removeTableFolderQuery)(subFolder.id)];
                case 14:
                    _f.sent();
                    _f.label = 15;
                case 15:
                    _b++;
                    return [3, 8];
                case 16: return [4, (0, tableFolders_1.removeTableFolderQuery)(req.params.id)];
                case 17:
                    _f.sent();
                    res.status(204).send();
                    return [3, 19];
                case 18:
                    err_5 = _f.sent();
                    next(err_5);
                    return [3, 19];
                case 19: return [2];
            }
        });
    });
}
exports.removeTableFolder = removeTableFolder;
function editTableFolderTitle(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, tableFolders_1.editTableFolderQuery)(req.params.id, {
                            title: req.body.title
                        })];
                case 1:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
                    return [3, 3];
                case 2:
                    err_6 = _a.sent();
                    next(err_6);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.editTableFolderTitle = editTableFolderTitle;
