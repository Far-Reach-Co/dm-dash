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
const s3_1 = require("./s3");
const authz_1 = require("../../lib/authz");
const tableResourceUtils_1 = require("./tableResourceUtils");
function tableImageNotFoundError() {
    return (0, tableResourceUtils_1.notFoundError)("Table image not found");
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
        return yield (0, tableResourceUtils_1.getOptionalTableEditAuth)(req, "canManageImageAssets");
    });
}
function addTableImageByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableAuth = yield getOptionalTableAuthForAssetMutation(req);
            if (tableAuth) {
                req.body.project_id = (0, tableResourceUtils_1.requireProjectIdFromTable)(tableAuth.table);
            }
            else {
                if (!req.body.project_id)
                    throw (0, tableResourceUtils_1.badRequestError)("project_id is required");
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
            const userId = (0, authz_1.requireUser)(req);
            const tableAuth = yield getOptionalTableAuthForAssetMutation(req);
            if (tableAuth) {
                req.body.user_id = (0, tableResourceUtils_1.requireUserIdFromTable)(tableAuth.table);
            }
            else {
                req.body.user_id = userId;
            }
            const data = yield (0, tableImages_1.addTableImageByUserQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
function toSignedUrlInput(rows) {
    return rows.map((row) => ({
        id: row.image_id,
        file_name: row.file_name,
        original_name: row.original_name,
        size: row.size,
        notes: row.notes,
        is_blocked: row.is_blocked,
    }));
}
function withSignedUrls(rows, signedUrls) {
    return rows.map((row) => (Object.assign(Object.assign({}, row), { src: signedUrls[row.image_id] })));
}
function getTableImagesWithSignedUrlsByTableProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { table: tableData } = yield (0, tableResourceUtils_1.requireTablePermissionById)(req, req.params.table_id, "view");
            const projectId = (0, tableResourceUtils_1.requireProjectIdFromTable)(tableData, "table_id");
            const data = yield (0, tableImages_1.getTableImagesWithImageByProjectQuery)(projectId);
            const signedUrls = yield (0, s3_1.getSignedUrls)(toSignedUrlInput(data.rows));
            const result = withSignedUrls(data.rows, signedUrls);
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
            const { table: tableData } = yield (0, tableResourceUtils_1.requireTablePermissionById)(req, req.params.table_id, "view");
            const userId = (0, tableResourceUtils_1.requireUserIdFromTable)(tableData, "table_id");
            const data = yield (0, tableImages_1.getTableImagesWithImageByUserQuery)(userId);
            const signedUrls = yield (0, s3_1.getSignedUrls)(toSignedUrlInput(data.rows));
            const result = withSignedUrls(data.rows, signedUrls);
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
            yield (0, tableResourceUtils_1.ensureScopedResourceEditable)(req, tableImage, tableAuth);
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
            yield (0, tableResourceUtils_1.ensureScopedResourceEditable)(req, tableImage, tableAuth);
            const payload = {};
            if (typeof req.body.folder_id !== "undefined") {
                payload.folder_id = req.body.folder_id;
            }
            if (!Object.keys(payload).length) {
                throw (0, tableResourceUtils_1.badRequestError)("No editable fields supplied");
            }
            const data = yield (0, tableImages_1.editTableImageQuery)(req.params.id, payload);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
