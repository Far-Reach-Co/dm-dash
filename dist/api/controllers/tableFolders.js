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
exports.getTableFoldersByProject = getTableFoldersByProject;
exports.getTableFoldersByUser = getTableFoldersByUser;
exports.addTableFolderByProject = addTableFolderByProject;
exports.addTableFolderByUser = addTableFolderByUser;
exports.removeTableFolder = removeTableFolder;
exports.editTableFolderTitle = editTableFolderTitle;
const tableFolders_1 = require("../queries/tableFolders");
const tableImages_1 = require("../queries/tableImages");
const authz_1 = require("../../lib/authz");
const tableResourceUtils_1 = require("./tableResourceUtils");
function getFolderByIdOrThrow(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const folderData = yield (0, tableFolders_1.getTableFolderQuery)(String(id));
        const folder = folderData.rows[0];
        if (!folder)
            throw (0, tableResourceUtils_1.notFoundError)("Folder not found");
        return folder;
    });
}
function getOptionalTableAuthForFolderMutation(req) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, tableResourceUtils_1.getOptionalTableEditAuth)(req, "canManageFolders");
    });
}
function addTableFolderByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableAuth = yield getOptionalTableAuthForFolderMutation(req);
            if (tableAuth) {
                const tableProjectId = (0, tableResourceUtils_1.requireProjectIdFromTable)(tableAuth.table);
                if (typeof req.body.project_id !== "undefined") {
                    (0, tableResourceUtils_1.assertProjectIdMatchesTable)(req.body.project_id, tableProjectId);
                }
                req.body.project_id = tableProjectId;
            }
            else {
                if (!req.body.project_id)
                    throw (0, tableResourceUtils_1.badRequestError)("project_id is required");
                yield (0, authz_1.requireProjectEditor)(req, req.body.project_id);
            }
            const data = yield (0, tableFolders_1.addTableFolderByProjectQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
function addTableFolderByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = (0, authz_1.requireUser)(req);
            const tableAuth = yield getOptionalTableAuthForFolderMutation(req);
            if (tableAuth) {
                req.body.user_id = (0, tableResourceUtils_1.requireUserIdFromTable)(tableAuth.table);
            }
            else {
                req.body.user_id = userId;
            }
            const data = yield (0, tableFolders_1.addTableFolderByUserQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
function getTableFoldersByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const access = yield (0, authz_1.getProjectAccess)(req, req.params.project_id);
            if (!access)
                throw (0, tableResourceUtils_1.forbiddenError)();
            const data = yield (0, tableFolders_1.getTableFoldersByProjectQuery)(req.params.project_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
function getTableFoldersByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = (0, authz_1.requireUser)(req);
            const data = yield (0, tableFolders_1.getTableFoldersByUserQuery)(userId);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
function removeTableFolder(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableAuth = yield getOptionalTableAuthForFolderMutation(req);
            const folder = yield getFolderByIdOrThrow(req.params.id);
            yield (0, tableResourceUtils_1.ensureScopedResourceEditable)(req, folder, tableAuth);
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
function editTableFolderTitle(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableAuth = yield getOptionalTableAuthForFolderMutation(req);
            const folder = yield getFolderByIdOrThrow(req.params.id);
            yield (0, tableResourceUtils_1.ensureScopedResourceEditable)(req, folder, tableAuth);
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
