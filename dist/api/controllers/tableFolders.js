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
const tableViews_1 = require("../queries/tableViews");
const authz_1 = require("../../lib/authz");
const tableAuthz_1 = require("../../lib/tableAuthz");
function forbiddenError() {
    const err = new Error("Forbidden");
    err.status = 403;
    return err;
}
function badRequestError(message) {
    const err = new Error(message);
    err.status = 400;
    return err;
}
function notFoundError(message) {
    const err = new Error(message);
    err.status = 404;
    return err;
}
function getTableViewByIdOrThrow(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const tableData = yield (0, tableViews_1.getTableViewQuery)(id);
        const table = tableData.rows[0];
        if (!table)
            throw notFoundError("Table view not found");
        return table;
    });
}
function getFolderByIdOrThrow(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const folderData = yield (0, tableFolders_1.getTableFolderQuery)(String(id));
        const folder = folderData.rows[0];
        if (!folder)
            throw notFoundError("Folder not found");
        return folder;
    });
}
function ensureFolderEditable(req, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        if (folder.project_id) {
            const access = yield (0, authz_1.getProjectAccess)(req, folder.project_id);
            if (!(access === null || access === void 0 ? void 0 : access.isEditor))
                throw forbiddenError();
            return;
        }
        const userId = (0, authz_1.requireUser)(req);
        if (String(folder.user_id) !== String(userId))
            throw forbiddenError();
    });
}
function ensureProjectEditor(req, projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!projectId)
            throw badRequestError("project_id is required");
        const access = yield (0, authz_1.getProjectAccess)(req, projectId);
        if (!(access === null || access === void 0 ? void 0 : access.isEditor))
            throw forbiddenError();
    });
}
function getOptionalTableAuthForFolderMutation(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const tableViewIdRaw = (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.table_view_id) !== null && _b !== void 0 ? _b : (_c = req.query) === null || _c === void 0 ? void 0 : _c.table_view_id;
        if (typeof tableViewIdRaw === "undefined")
            return null;
        const tableViewId = Number(tableViewIdRaw);
        if (Number.isNaN(tableViewId) || tableViewId <= 0) {
            throw badRequestError("table_view_id must be a valid number");
        }
        const table = yield getTableViewByIdOrThrow(tableViewId);
        const auth = yield (0, tableAuthz_1.requireTablePermission)(req, table, "edit");
        (0, tableAuthz_1.assertTableCapability)(auth, "canManageFolders");
        return { table, auth };
    });
}
function addTableFolderByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield getOptionalTableAuthForFolderMutation(req);
            yield ensureProjectEditor(req, req.body.project_id);
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
            if (!req.session.user)
                throw { message: "User is not logged in" };
            yield getOptionalTableAuthForFolderMutation(req);
            req.body.user_id = req.session.user;
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
                throw forbiddenError();
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
            yield getOptionalTableAuthForFolderMutation(req);
            const folder = yield getFolderByIdOrThrow(req.params.id);
            yield ensureFolderEditable(req, folder);
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
            yield getOptionalTableAuthForFolderMutation(req);
            const folder = yield getFolderByIdOrThrow(req.params.id);
            yield ensureFolderEditable(req, folder);
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
