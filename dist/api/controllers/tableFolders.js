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
exports.editTableFolderTitle = exports.removeTableFolder = exports.addTableFolderByUser = exports.addTableFolderByProject = exports.getTableFoldersByUser = exports.getTableFoldersByProject = void 0;
const tableFolders_1 = require("../queries/tableFolders");
const tableImages_1 = require("../queries/tableImages");
function addTableFolderByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, tableFolders_1.addTableFolderByProjectQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addTableFolderByProject = addTableFolderByProject;
function addTableFolderByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw { message: "User is not logged in" };
            req.body.user_id = req.session.user;
            const data = yield (0, tableFolders_1.addTableFolderByUserQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addTableFolderByUser = addTableFolderByUser;
function getTableFoldersByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, tableFolders_1.getTableFoldersByProjectQuery)(req.params.project_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getTableFoldersByProject = getTableFoldersByProject;
function getTableFoldersByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw { message: "User is not logged in" };
            const data = yield (0, tableFolders_1.getTableFoldersByUserQuery)(req.session.user);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getTableFoldersByUser = getTableFoldersByUser;
function removeTableFolder(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const folderData = yield (0, tableFolders_1.getTableFolderQuery)(req.params.id);
            const folder = folderData.rows[0];
            const tableImages = yield (0, tableImages_1.getTableImagesByFolderQuery)(req.params.id);
            for (const tableImage of tableImages.rows) {
                yield (0, tableImages_1.editTableImageQuery)(tableImage.id, {
                    folder_id: folder.parent_folder_id,
                });
            }
            const subFoldersData = yield (0, tableFolders_1.getTableFoldersByParentQuery)(req.params.id);
            for (const subFolder of subFoldersData.rows) {
                const subFolderTableImages = yield (0, tableImages_1.getTableImagesByFolderQuery)(subFolder.id);
                for (const subTableImage of subFolderTableImages.rows) {
                    yield (0, tableImages_1.editTableImageQuery)(subTableImage.id, {
                        folder_id: folder.parent_folder_id,
                    });
                }
                yield (0, tableFolders_1.removeTableFolderQuery)(subFolder.id);
            }
            yield (0, tableFolders_1.removeTableFolderQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeTableFolder = removeTableFolder;
function editTableFolderTitle(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, tableFolders_1.editTableFolderQuery)(req.params.id, {
                title: req.body.title,
            });
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editTableFolderTitle = editTableFolderTitle;
