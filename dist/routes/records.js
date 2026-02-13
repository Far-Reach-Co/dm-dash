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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const record_1 = require("../api/queries/record");
const recordImage_1 = require("../api/queries/recordImage");
const images_1 = require("../api/queries/images");
const s3_1 = require("../api/controllers/s3");
const projects_1 = require("../api/queries/projects");
const logger_js_1 = __importDefault(require("../lib/logger.js"));
const authz_1 = require("../lib/authz");
const recentlyViewed_1 = require("../api/queries/recentlyViewed");
const router = (0, express_1.Router)();
router.get("/newrecord", (req, res, next) => {
    try {
        if (!(0, authz_1.requireUserOrRedirect)(req, res, "/forbidden"))
            return;
        res.render("newrecord", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/editrecord", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.query.id)
            return res.redirect("/404");
        const recordId = req.query.id;
        const userId = req.session.user;
        const data = yield (0, record_1.getRecordQuery)(recordId);
        const record = data.rows[0];
        const recordImageData = yield (0, recordImage_1.getRecordImagesByRecordQuery)(recordId);
        let imagesFromRecordImages = [];
        let imageUrls = {};
        if (recordImageData.rows.length) {
            const imageIds = recordImageData.rows.map((ri) => ri.image_id);
            const imageDataList = yield (0, images_1.getImagesQuery)(imageIds);
            imagesFromRecordImages = imageDataList.rows;
            imageUrls = yield (0, s3_1.getSignedUrls)(imagesFromRecordImages);
            logger_js_1.default.debug({ recordId, imageCount: imageIds.length }, "Loaded record image URLs");
        }
        if (!req.query.project_id) {
            const access = yield (0, authz_1.requireRecordAccessOrRedirect)(req, res, record, {
                mode: "edit",
                redirectTo: "/forbidden",
            });
            if (!access)
                return;
        }
        else {
            const projectId = req.query.project_id;
            const access = yield (0, authz_1.requireRecordAccessOrRedirect)(req, res, record, {
                mode: "edit",
                projectId,
                redirectTo: "/forbidden",
            });
            if (!access)
                return;
        }
        res.render("editrecord", {
            auth: userId,
            record: record,
            imageUrls: imageUrls,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/record", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.query.id)
            return res.redirect("/404");
        const recordId = req.query.id;
        const userId = req.session.user;
        const recordData = yield (0, record_1.getRecordQuery)(recordId);
        const record = recordData.rows[0];
        const recordImageData = yield (0, recordImage_1.getRecordImagesByRecordQuery)(recordId);
        let imagesFromRecordImages = [];
        let imageUrls = {};
        if (recordImageData.rows.length) {
            const imageIds = recordImageData.rows.map((ri) => ri.image_id);
            const imageDataList = yield (0, images_1.getImagesQuery)(imageIds);
            imagesFromRecordImages = imageDataList.rows;
            imageUrls = yield (0, s3_1.getSignedUrls)(imagesFromRecordImages);
            logger_js_1.default.debug({ recordId, imageCount: imageIds.length }, "Loaded record image URLs");
        }
        if (userId) {
            (0, recentlyViewed_1.upsertRecentlyViewed)(userId, "record", recordId);
        }
        if (!req.query.project_id) {
            const access = yield (0, authz_1.requireRecordAccessOrRedirect)(req, res, record, {
                mode: "view",
                redirectTo: "/forbidden",
            });
            if (!access)
                return;
            return res.render("record", {
                auth: userId,
                record: record,
                imageUrls: imageUrls,
                projectId: null,
                canEdit: access.canEdit,
            });
        }
        else {
            const projectId = req.query.project_id;
            const access = yield (0, authz_1.requireRecordAccessOrRedirect)(req, res, record, {
                mode: "view",
                projectId,
                redirectTo: "/forbidden",
            });
            if (!access)
                return;
            const projectData = yield (0, projects_1.getProjectQuery)(projectId);
            const project = projectData.rows[0];
            return res.render("record", {
                auth: userId,
                record: record,
                imageUrls: imageUrls,
                projectId: project.id,
                canEdit: access.canEdit,
            });
        }
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
