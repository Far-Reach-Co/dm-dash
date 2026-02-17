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
exports.getTableImagesWithSignedUrlsByTableProject = getTableImagesWithSignedUrlsByTableProject;
exports.getTableImagesWithSignedUrlsByTableUser = getTableImagesWithSignedUrlsByTableUser;
exports.addTableImageByUser = addTableImageByUser;
exports.addTableImageByProject = addTableImageByProject;
exports.removeTableImage = removeTableImage;
exports.editTableImage = editTableImage;
const tableImages_1 = require("../queries/tableImages");
const tableViews_1 = require("../queries/tableViews");
const s3_1 = require("./s3");
const authz_1 = require("../../lib/authz");
const tableAuthz_1 = require("../../lib/tableAuthz");
function badRequest(message) {
    const err = new Error(message);
    err.status = 400;
    return err;
}
function tableNotFoundError() {
    const err = new Error("Table view not found");
    err.status = 404;
    return err;
}
function tableImageNotFoundError() {
    const err = new Error("Table image not found");
    err.status = 404;
    return err;
}
function forbiddenError(message = "Forbidden") {
    const err = new Error(message);
    err.status = 403;
    return err;
}
function getTableViewByIdOrThrow(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield (0, tableViews_1.getTableViewQuery)(id);
        const table = data.rows[0];
        if (!table)
            throw tableNotFoundError();
        return table;
    });
}
function getTableImageByIdOrThrow(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield (0, tableImages_1.getTableImageQuery)(String(id));
        const tableImage = data.rows[0];
        if (!tableImage)
            throw tableImageNotFoundError();
        return tableImage;
    });
}
function getOptionalTableAuthForAssetMutation(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const tableViewIdRaw = (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.table_view_id) !== null && _b !== void 0 ? _b : (_c = req.query) === null || _c === void 0 ? void 0 : _c.table_view_id;
        if (typeof tableViewIdRaw === "undefined")
            return null;
        const tableViewId = Number(tableViewIdRaw);
        if (Number.isNaN(tableViewId) || tableViewId <= 0) {
            throw badRequest("table_view_id must be a valid number");
        }
        const table = yield getTableViewByIdOrThrow(tableViewId);
        const auth = yield (0, tableAuthz_1.requireTablePermission)(req, table, "edit");
        (0, tableAuthz_1.assertTableCapability)(auth, "canManageImageAssets");
        return { table, auth };
    });
}
function ensureTableImageEditable(req, tableImage, tableAuth) {
    return __awaiter(this, void 0, void 0, function* () {
        if (tableAuth) {
            if (tableImage.project_id) {
                if (String(tableImage.project_id) !== String(tableAuth.table.project_id)) {
                    throw forbiddenError();
                }
                return;
            }
            if (tableImage.user_id) {
                if (String(tableImage.user_id) !== String(tableAuth.table.user_id)) {
                    throw forbiddenError();
                }
                return;
            }
            throw forbiddenError();
        }
        if (tableImage.project_id) {
            yield (0, authz_1.requireProjectEditor)(req, tableImage.project_id);
            return;
        }
        if (tableImage.user_id) {
            const userId = (0, authz_1.requireUser)(req);
            if (String(tableImage.user_id) !== String(userId))
                throw forbiddenError();
            return;
        }
        throw forbiddenError();
    });
}
function addTableImageByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableAuth = yield getOptionalTableAuthForAssetMutation(req);
            if (tableAuth) {
                if (!tableAuth.table.project_id) {
                    throw badRequest("table_view_id is not a project table");
                }
                req.body.project_id = tableAuth.table.project_id;
            }
            else {
                if (!req.body.project_id)
                    throw badRequest("project_id is required");
                yield (0, authz_1.requireProjectEditor)(req, req.body.project_id);
            }
            const data = yield (0, tableImages_1.addTableImageByProjectQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
function addTableImageByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const tableAuth = yield getOptionalTableAuthForAssetMutation(req);
            if (tableAuth) {
                if (!tableAuth.table.user_id) {
                    throw badRequest("table_view_id is not a user table");
                }
                req.body.user_id = tableAuth.table.user_id;
            }
            else {
                req.body.user_id = req.session.user;
            }
            const data = yield (0, tableImages_1.addTableImageByUserQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
function getTableImagesWithSignedUrlsByTableProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableData = yield getTableViewByIdOrThrow(req.params.table_id);
            yield (0, tableAuthz_1.requireTablePermission)(req, tableData, "view");
            if (!tableData.project_id) {
                throw badRequest("table_id is not a project table");
            }
            const data = yield (0, tableImages_1.getTableImagesWithImageByProjectQuery)(tableData.project_id);
            const images = data.rows.map((row) => ({
                id: row.image_id,
                file_name: row.file_name,
                original_name: row.original_name,
                size: row.size,
                notes: row.notes,
                is_blocked: row.is_blocked,
            }));
            const signedUrls = yield (0, s3_1.getSignedUrls)(images);
            const result = data.rows.map((row) => (Object.assign(Object.assign({}, row), { src: signedUrls[row.image_id] })));
            res.send(result);
        }
        catch (err) {
            next(err);
        }
    });
}
function getTableImagesWithSignedUrlsByTableUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableData = yield getTableViewByIdOrThrow(req.params.table_id);
            yield (0, tableAuthz_1.requireTablePermission)(req, tableData, "view");
            if (!tableData.user_id) {
                throw badRequest("table_id is not a user table");
            }
            const data = yield (0, tableImages_1.getTableImagesWithImageByUserQuery)(tableData.user_id);
            const images = data.rows.map((row) => ({
                id: row.image_id,
                file_name: row.file_name,
                original_name: row.original_name,
                size: row.size,
                notes: row.notes,
                is_blocked: row.is_blocked,
            }));
            const signedUrls = yield (0, s3_1.getSignedUrls)(images);
            const result = data.rows.map((row) => (Object.assign(Object.assign({}, row), { src: signedUrls[row.image_id] })));
            res.send(result);
        }
        catch (err) {
            next(err);
        }
    });
}
function removeTableImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableImage = yield getTableImageByIdOrThrow(req.params.id);
            const tableAuth = yield getOptionalTableAuthForAssetMutation(req);
            yield ensureTableImageEditable(req, tableImage, tableAuth);
            yield (0, tableImages_1.removeTableImageQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
function editTableImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableImage = yield getTableImageByIdOrThrow(req.params.id);
            const tableAuth = yield getOptionalTableAuthForAssetMutation(req);
            yield ensureTableImageEditable(req, tableImage, tableAuth);
            const payload = {};
            if (typeof req.body.folder_id !== "undefined") {
                payload.folder_id = req.body.folder_id;
            }
            if (!Object.keys(payload).length) {
                throw badRequest("No editable fields supplied");
            }
            const data = yield (0, tableImages_1.editTableImageQuery)(req.params.id, payload);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
