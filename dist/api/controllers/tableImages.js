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
function addTableImageByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
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
            req.body.user_id = req.session.user;
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
            const tableData = yield (0, tableViews_1.getTableViewQuery)(req.params.table_id);
            const data = yield (0, tableImages_1.getTableImagesWithImageByProjectQuery)(tableData.rows[0].project_id);
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
            const tableData = yield (0, tableViews_1.getTableViewQuery)(req.params.table_id);
            const data = yield (0, tableImages_1.getTableImagesWithImageByUserQuery)(tableData.rows[0].user_id);
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
            const data = yield (0, tableImages_1.editTableImageQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
