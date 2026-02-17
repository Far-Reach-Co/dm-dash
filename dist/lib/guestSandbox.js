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
exports.buildGuestSandboxCapabilities = void 0;
exports.ensureGuestId = ensureGuestId;
exports.getGuestSandboxTtlSeconds = getGuestSandboxTtlSeconds;
exports.createGuestSandbox = createGuestSandbox;
exports.getGuestSandbox = getGuestSandbox;
exports.requireGuestSandboxAccess = requireGuestSandboxAccess;
exports.touchGuestSandbox = touchGuestSandbox;
exports.saveGuestSandboxData = saveGuestSandboxData;
const crypto_1 = require("crypto");
const redis_1 = require("redis");
const logger_js_1 = __importDefault(require("./logger.js"));
const dbconfig_1 = __importDefault(require("../api/dbconfig"));
const httpErrors_1 = require("./httpErrors");
const tableAuthz_1 = require("./tableAuthz");
Object.defineProperty(exports, "buildGuestSandboxCapabilities", { enumerable: true, get: function () { return tableAuthz_1.buildGuestSandboxCapabilities; } });
const GUEST_SANDBOX_PREFIX = "frc:guest:sandbox:";
const DEFAULT_GUEST_SANDBOX_TITLE = "Sandbox Demo";
const GUEST_SANDBOX_TTL_SECONDS = Math.max(60, Number(process.env.GUEST_SANDBOX_TTL_SECONDS || 12 * 60 * 60));
const GUEST_SANDBOX_MAX_IMAGES = Math.max(1, Number(process.env.GUEST_SANDBOX_MAX_IMAGES || 30));
const GUEST_SANDBOX_MAX_DATA_BYTES = Math.max(1024, Number(process.env.GUEST_SANDBOX_MAX_DATA_BYTES || 2 * 1024 * 1024));
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const guestSandboxRedisClient = (0, redis_1.createClient)({ url: redisUrl });
guestSandboxRedisClient.on("error", (err) => {
    logger_js_1.default.error({ err }, "Guest sandbox Redis client error");
});
let guestSandboxRedisReady = null;
function getGuestSandboxKey(id) {
    return `${GUEST_SANDBOX_PREFIX}${id}`;
}
function ensureGuestSandboxRedisReady() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!guestSandboxRedisReady) {
            guestSandboxRedisReady = guestSandboxRedisClient.connect().catch((err) => {
                guestSandboxRedisReady = null;
                throw err;
            });
        }
        yield guestSandboxRedisReady;
    });
}
function normalizeStarterImageIds(input) {
    if (!Array.isArray(input))
        return [];
    const ids = input
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value))
        .map((value) => Math.trunc(value))
        .filter((value) => value > 0);
    return Array.from(new Set(ids)).slice(0, GUEST_SANDBOX_MAX_IMAGES);
}
function loadCuratedGuestImageIds() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: 'select id from public."Image" where is_blocked = false and file_name like $1 order by file_name asc limit $2',
            values: ["guest-token-%", GUEST_SANDBOX_MAX_IMAGES],
        };
        const { rows } = yield dbconfig_1.default.query(query);
        return rows
            .map((row) => Number(row.id))
            .filter((id) => Number.isFinite(id) && id > 0);
    });
}
function sanitizeTitle(title) {
    if (typeof title !== "string")
        return DEFAULT_GUEST_SANDBOX_TITLE;
    const trimmed = title.trim();
    return trimmed.length ? trimmed.slice(0, 120) : DEFAULT_GUEST_SANDBOX_TITLE;
}
function guestSandboxNotFoundError() {
    return (0, httpErrors_1.notFoundError)("Guest sandbox not found");
}
function writeGuestSandbox(record) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ensureGuestSandboxRedisReady();
        yield guestSandboxRedisClient.setEx(getGuestSandboxKey(record.id), GUEST_SANDBOX_TTL_SECONDS, JSON.stringify(record));
    });
}
function resolveStarterImageIds(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const requestedStarterIds = normalizeStarterImageIds(input);
        if (requestedStarterIds.length) {
            return requestedStarterIds;
        }
        return yield loadCuratedGuestImageIds();
    });
}
function ensureGuestId(req) {
    if (!req.session.guest_id) {
        req.session.guest_id = (0, crypto_1.randomUUID)();
    }
    return req.session.guest_id;
}
function getGuestSandboxTtlSeconds() {
    return GUEST_SANDBOX_TTL_SECONDS;
}
function createGuestSandbox(req, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const guestId = ensureGuestId(req);
        const existingId = req.session.guest_sandbox_id;
        if (existingId) {
            const existing = yield getGuestSandbox(existingId);
            if (existing && String(existing.guest_id) === String(guestId)) {
                return existing;
            }
        }
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const starterImageIds = yield resolveStarterImageIds(options === null || options === void 0 ? void 0 : options.starter_image_ids);
        if (!starterImageIds.length) {
            throw (0, httpErrors_1.badRequestError)("Guest sandbox has no curated images available");
        }
        const record = {
            id,
            guest_id: guestId,
            title: sanitizeTitle(options === null || options === void 0 ? void 0 : options.title),
            mode: "sandbox",
            starter_image_ids: starterImageIds,
            data: { objects: [] },
            created_at: now,
            updated_at: now,
        };
        yield writeGuestSandbox(record);
        req.session.guest_sandbox_id = id;
        return record;
    });
}
function getGuestSandbox(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ensureGuestSandboxRedisReady();
        const value = yield guestSandboxRedisClient.get(getGuestSandboxKey(id));
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch (err) {
            logger_js_1.default.warn({ err, guestSandboxId: id }, "Invalid guest sandbox payload");
            return null;
        }
    });
}
function requireGuestSandboxAccess(_req, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const record = yield getGuestSandbox(id);
        if (!record)
            throw guestSandboxNotFoundError();
        return record;
    });
}
function touchGuestSandbox(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ensureGuestSandboxRedisReady();
        yield guestSandboxRedisClient.expire(getGuestSandboxKey(id), GUEST_SANDBOX_TTL_SECONDS);
    });
}
function saveGuestSandboxData(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw (0, httpErrors_1.badRequestError)("Invalid sandbox data");
        }
        const dataJson = JSON.stringify(data);
        if (Buffer.byteLength(dataJson, "utf8") > GUEST_SANDBOX_MAX_DATA_BYTES) {
            throw (0, httpErrors_1.badRequestError)("Sandbox data exceeds size limit");
        }
        const record = yield getGuestSandbox(id);
        if (!record)
            throw guestSandboxNotFoundError();
        const updated = Object.assign(Object.assign({}, record), { data: JSON.parse(dataJson), updated_at: new Date().toISOString() });
        yield writeGuestSandbox(updated);
        return updated;
    });
}
