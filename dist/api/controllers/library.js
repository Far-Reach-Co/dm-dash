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
exports.getLibraryImagesByUser = getLibraryImagesByUser;
exports.getLibraryImagesByProject = getLibraryImagesByProject;
exports.getLibraryImagesByUserInFolder = getLibraryImagesByUserInFolder;
exports.getLibraryImagesByProjectInFolder = getLibraryImagesByProjectInFolder;
exports.getLibraryImageCountsByUser = getLibraryImageCountsByUser;
exports.getLibraryImageCountsByProject = getLibraryImageCountsByProject;
const tableImages_1 = require("../queries/tableImages");
const s3_1 = require("./s3");
function getLibraryImagesByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);
            const offset = parseInt(req.query.offset) || 0;
            const [data, countData] = yield Promise.all([
                (0, tableImages_1.getTableImagesWithImageByUserPaginatedQuery)(req.session.user, limit, offset),
                (0, tableImages_1.getTableImageCountByUserQuery)(req.session.user),
            ]);
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
            res.send({
                images: result,
                total: parseInt(countData.rows[0].count),
                limit,
                offset,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getLibraryImagesByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);
            const offset = parseInt(req.query.offset) || 0;
            const [data, countData] = yield Promise.all([
                (0, tableImages_1.getTableImagesWithImageByProjectPaginatedQuery)(req.params.project_id, limit, offset),
                (0, tableImages_1.getTableImageCountByProjectQuery)(req.params.project_id),
            ]);
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
            res.send({
                images: result,
                total: parseInt(countData.rows[0].count),
                limit,
                offset,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getLibraryImagesByUserInFolder(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const folderParam = req.params.folder_id;
            const parsedFolderId = parseInt(folderParam);
            const folderId = folderParam === "unsorted" || Number.isNaN(parsedFolderId)
                ? null
                : parsedFolderId;
            const data = yield (0, tableImages_1.getTableImagesWithImageByUserInFolderQuery)(req.session.user, folderId);
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
            res.send({
                images: result,
                total: result.length,
                limit: result.length,
                offset: 0,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getLibraryImagesByProjectInFolder(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const folderParam = req.params.folder_id;
            const parsedFolderId = parseInt(folderParam);
            const folderId = folderParam === "unsorted" || Number.isNaN(parsedFolderId)
                ? null
                : parsedFolderId;
            const data = yield (0, tableImages_1.getTableImagesWithImageByProjectInFolderQuery)(req.params.project_id, folderId);
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
            res.send({
                images: result,
                total: result.length,
                limit: result.length,
                offset: 0,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getLibraryImageCountsByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const countsData = yield (0, tableImages_1.getTableImageCountsByUserQuery)(req.session.user);
            const by_folder = {};
            let total = 0;
            let unsorted = 0;
            for (const row of countsData.rows) {
                total += row.count;
                if (row.folder_id === null) {
                    unsorted = row.count;
                }
                else {
                    by_folder[String(row.folder_id)] = row.count;
                }
            }
            res.send({ total, unsorted, by_folder });
        }
        catch (err) {
            next(err);
        }
    });
}
function getLibraryImageCountsByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const countsData = yield (0, tableImages_1.getTableImageCountsByProjectQuery)(req.params.project_id);
            const by_folder = {};
            let total = 0;
            let unsorted = 0;
            for (const row of countsData.rows) {
                total += row.count;
                if (row.folder_id === null) {
                    unsorted = row.count;
                }
                else {
                    by_folder[String(row.folder_id)] = row.count;
                }
            }
            res.send({ total, unsorted, by_folder });
        }
        catch (err) {
            next(err);
        }
    });
}
