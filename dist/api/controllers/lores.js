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
exports.editLore = exports.removeLore = exports.addLore = exports.getLores = exports.getLore = void 0;
const lores_js_1 = require("../queries/lores.js");
const projects_js_1 = require("../queries/projects.js");
const s3_js_1 = require("./s3.js");
const images_js_1 = require("../queries/images.js");
function addLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, lores_js_1.addLoreQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addLore = addLore;
function getLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const loreData = yield (0, lores_js_1.getLoreQuery)(req.params.id);
            const lore = loreData.rows[0];
            res.send(lore);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getLore = getLore;
function getLores(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.params.keyword && req.params.filter) {
            try {
                const data = yield (0, lores_js_1.getLoresWithKeywordAndFilterQuery)({
                    projectId: req.params.project_id,
                    limit: req.params.limit,
                    offset: req.params.offset,
                    keyword: req.params.keyword,
                    filter: req.params.filter,
                });
                res.send(data.rows);
            }
            catch (err) {
                next(err);
            }
        }
        else if (req.params.keyword && !req.params.filter) {
            try {
                const data = yield (0, lores_js_1.getLoresWithKeywordQuery)({
                    projectId: req.params.project_id,
                    limit: req.params.limit,
                    offset: req.params.offset,
                    keyword: req.params.keyword,
                });
                res.send(data.rows);
            }
            catch (err) {
                next(err);
            }
        }
        else if (req.params.filter && !req.params.keyword) {
            try {
                const data = yield (0, lores_js_1.getLoresWithFilterQuery)({
                    projectId: req.params.project_id,
                    limit: req.params.limit,
                    offset: req.params.offset,
                    filter: req.params.filter,
                });
                res.send(data.rows);
            }
            catch (err) {
                next(err);
            }
        }
        else {
            try {
                const data = yield (0, lores_js_1.getLoresQuery)({
                    projectId: req.params.project_id,
                    limit: req.params.limit,
                    offset: req.params.offset,
                });
                res.send(data.rows);
            }
            catch (err) {
                next(err);
            }
        }
    });
}
exports.getLores = getLores;
function removeLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const LoreData = yield (0, lores_js_1.getLoreQuery)(req.params.id);
            const Lore = LoreData.rows[0];
            const projectData = yield (0, projects_js_1.getProjectQuery)(Lore.project_id);
            const project = projectData.rows[0];
            const data = yield (0, lores_js_1.removeLoreQuery)(req.params.id);
            res.status(204).send();
            if (Lore.image_id) {
                const imageData = yield (0, images_js_1.getImageQuery)(Lore.image_id);
                const image = imageData.rows[0];
                yield (0, s3_js_1.removeImage)("wyrld/images", image);
                yield (0, images_js_1.removeImageQuery)(image.id);
                const newCalculatedData = project.used_data_in_bytes - image.size;
                yield (0, projects_js_1.editProjectQuery)(project.id, {
                    used_data_in_bytes: newCalculatedData,
                });
            }
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeLore = removeLore;
function editLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, lores_js_1.editLoreQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editLore = editLore;
