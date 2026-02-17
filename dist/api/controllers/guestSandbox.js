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
exports.startGuestSandbox = startGuestSandbox;
exports.getGuestSandboxView = getGuestSandboxView;
exports.editGuestSandboxData = editGuestSandboxData;
exports.getGuestSandboxImages = getGuestSandboxImages;
exports.getGuestSandboxImageCounts = getGuestSandboxImageCounts;
const images_js_1 = require("../queries/images.js");
const s3_1 = require("./s3");
const guestSandbox_js_1 = require("../../lib/guestSandbox.js");
const httpErrors_1 = require("../../lib/httpErrors");
const DEFAULT_LIMIT = 60;
const MIN_LIMIT = 1;
const MAX_LIMIT = 120;
const MIN_OFFSET = 0;
function parsePaginationInt(raw, fallback, min, max) {
    const value = Number(raw);
    if (!Number.isFinite(value))
        return fallback;
    return Math.max(min, Math.min(max, Math.trunc(value)));
}
function parseImageSort(raw) {
    if (raw === "name" || raw === "size")
        return raw;
    return "newest";
}
function parseImageLibraryQuery(query) {
    return {
        limit: parsePaginationInt(query.limit, DEFAULT_LIMIT, MIN_LIMIT, MAX_LIMIT),
        offset: parsePaginationInt(query.offset, 0, MIN_OFFSET, Number.MAX_SAFE_INTEGER),
        search: normalizeSearch(query.q),
        sort: parseImageSort(query.sort),
    };
}
function normalizeSearch(raw) {
    if (typeof raw !== "string")
        return "";
    return raw.trim().toLowerCase();
}
function sortImages(images, sort) {
    if (sort === "name") {
        return [...images].sort((a, b) => a.original_name.localeCompare(b.original_name));
    }
    if (sort === "size") {
        return [...images].sort((a, b) => b.size - a.size);
    }
    return [...images].sort((a, b) => b.id - a.id);
}
function getStarterImageIds(record) {
    if (!Array.isArray(record.starter_image_ids))
        return [];
    return record.starter_image_ids
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
        .map((value) => Math.trunc(value));
}
function mapGuestTableImages(sandboxId, page, signedUrls) {
    return page.map((img) => ({
        id: `guest-table-image-${sandboxId}-${img.id}`,
        image_id: img.id,
        original_name: img.original_name,
        size: img.size,
        file_name: img.file_name,
        notes: img.notes,
        src: signedUrls[img.id],
        folder_id: null,
        record_id: null,
        record_title: null,
        record_desc: null,
    }));
}
function startGuestSandbox(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            if (typeof ((_a = req.body) === null || _a === void 0 ? void 0 : _a.image_ids) !== "undefined") {
                throw (0, httpErrors_1.badRequestError)("image_ids is not allowed for guest sandboxes");
            }
            const record = yield (0, guestSandbox_js_1.createGuestSandbox)(req, {
                title: (_b = req.body) === null || _b === void 0 ? void 0 : _b.title,
            });
            res.status(201).send({
                uuid: record.id,
                redirect: `/vtt?guest_uuid=${record.id}`,
                expires_in_seconds: (0, guestSandbox_js_1.getGuestSandboxTtlSeconds)(),
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getGuestSandboxView(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const record = yield (0, guestSandbox_js_1.requireGuestSandboxAccess)(req, req.params.uuid);
            yield (0, guestSandbox_js_1.touchGuestSandbox)(record.id);
            const starterImageIds = getStarterImageIds(record);
            res.send({
                id: record.id,
                uuid: record.id,
                title: record.title,
                mode: record.mode,
                data: record.data || { objects: [] },
                is_public: false,
                project_id: null,
                user_id: null,
                is_guest_sandbox: true,
                guest_sandbox_id: record.id,
                starter_image_ids: starterImageIds,
                data_save_url: `/api/edit_guest_sandbox_data/${record.id}`,
                capabilities: (0, guestSandbox_js_1.buildGuestSandboxCapabilities)(),
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function editGuestSandboxData(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const record = yield (0, guestSandbox_js_1.requireGuestSandboxAccess)(req, req.params.uuid);
            if (typeof ((_a = req.body) === null || _a === void 0 ? void 0 : _a.data) === "undefined") {
                throw (0, httpErrors_1.badRequestError)("Missing sandbox data");
            }
            yield (0, guestSandbox_js_1.saveGuestSandboxData)(record.id, req.body.data);
            res.status(200).send({ message: "Saved" });
        }
        catch (err) {
            next(err);
        }
    });
}
function getGuestSandboxImages(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const record = yield (0, guestSandbox_js_1.requireGuestSandboxAccess)(req, req.params.uuid);
            yield (0, guestSandbox_js_1.touchGuestSandbox)(record.id);
            const { limit, offset, search, sort } = parseImageLibraryQuery(req.query);
            const imageIds = getStarterImageIds(record);
            if (!imageIds.length) {
                res.send({
                    images: [],
                    total: 0,
                    limit,
                    offset: 0,
                });
                return;
            }
            const allImages = (yield (0, images_js_1.getImagesQuery)(imageIds)).rows;
            const filtered = search
                ? allImages.filter((img) => String(img.original_name || "").toLowerCase().includes(search))
                : allImages;
            const sorted = sortImages(filtered, sort);
            const page = sorted.slice(offset, offset + limit);
            const nextOffset = offset + page.length;
            const signedUrls = yield (0, s3_1.getSignedUrls)(page);
            const responseImages = mapGuestTableImages(record.id, page, signedUrls);
            res.send({
                images: responseImages,
                total: sorted.length,
                limit,
                offset: nextOffset,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getGuestSandboxImageCounts(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const record = yield (0, guestSandbox_js_1.requireGuestSandboxAccess)(req, req.params.uuid);
            yield (0, guestSandbox_js_1.touchGuestSandbox)(record.id);
            const total = getStarterImageIds(record).length;
            res.send({
                total,
                unsorted: total,
                by_folder: {},
            });
        }
        catch (err) {
            next(err);
        }
    });
}
