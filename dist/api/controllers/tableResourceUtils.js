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
exports.notFoundError = exports.forbiddenError = exports.badRequestError = exports.createHttpError = void 0;
exports.parsePositiveInt = parsePositiveInt;
exports.getTableViewByIdOrThrow = getTableViewByIdOrThrow;
exports.getTableViewByUUIDOrThrow = getTableViewByUUIDOrThrow;
exports.requireTablePermissionById = requireTablePermissionById;
exports.getOptionalTableEditAuth = getOptionalTableEditAuth;
exports.requireProjectIdFromTable = requireProjectIdFromTable;
exports.requireUserIdFromTable = requireUserIdFromTable;
exports.assertProjectIdMatchesTable = assertProjectIdMatchesTable;
exports.ensureScopedResourceEditable = ensureScopedResourceEditable;
const tableViews_js_1 = require("../queries/tableViews.js");
const tableAuthz_1 = require("../../lib/tableAuthz");
const authz_1 = require("../../lib/authz");
const httpErrors_1 = require("../../lib/httpErrors");
Object.defineProperty(exports, "badRequestError", { enumerable: true, get: function () { return httpErrors_1.badRequestError; } });
Object.defineProperty(exports, "createHttpError", { enumerable: true, get: function () { return httpErrors_1.createHttpError; } });
Object.defineProperty(exports, "forbiddenError", { enumerable: true, get: function () { return httpErrors_1.forbiddenError; } });
Object.defineProperty(exports, "notFoundError", { enumerable: true, get: function () { return httpErrors_1.notFoundError; } });
function parsePositiveInt(raw, fieldName, { required = true } = {}) {
    if (typeof raw === "undefined" || raw === null || raw === "") {
        if (!required)
            return null;
        throw (0, httpErrors_1.badRequestError)(`${fieldName} is required`);
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
        throw (0, httpErrors_1.badRequestError)(`${fieldName} must be a valid number`);
    }
    return Math.trunc(value);
}
function getTableViewByIdOrThrow(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield (0, tableViews_js_1.getTableViewQuery)(id);
        const table = data.rows[0];
        if (!table)
            throw (0, httpErrors_1.notFoundError)("Table view not found");
        return table;
    });
}
function getTableViewByUUIDOrThrow(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield (0, tableViews_js_1.getTableViewByUUIDQuery)(uuid);
        const table = data.rows[0];
        if (!table)
            throw (0, httpErrors_1.notFoundError)("Table view not found");
        return table;
    });
}
function requireTablePermissionById(req, tableViewId, mode, capability) {
    return __awaiter(this, void 0, void 0, function* () {
        const table = yield getTableViewByIdOrThrow(tableViewId);
        const auth = yield (0, tableAuthz_1.requireTablePermission)(req, table, mode);
        if (capability) {
            (0, tableAuthz_1.assertTableCapability)(auth, capability);
        }
        return { table, auth };
    });
}
function getOptionalTableEditAuth(req, capability) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const tableViewIdRaw = (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.table_view_id) !== null && _b !== void 0 ? _b : (_c = req.query) === null || _c === void 0 ? void 0 : _c.table_view_id;
        const tableViewId = parsePositiveInt(tableViewIdRaw, "table_view_id", {
            required: false,
        });
        if (tableViewId === null)
            return null;
        return yield requireTablePermissionById(req, tableViewId, "edit", capability);
    });
}
function requireProjectIdFromTable(table, fieldName = "table_view_id") {
    if (!table.project_id) {
        throw (0, httpErrors_1.badRequestError)(`${fieldName} is not a project table`);
    }
    return table.project_id;
}
function requireUserIdFromTable(table, fieldName = "table_view_id") {
    if (!table.user_id) {
        throw (0, httpErrors_1.badRequestError)(`${fieldName} is not a user table`);
    }
    return table.user_id;
}
function assertProjectIdMatchesTable(projectId, tableProjectId, fieldName = "table_view_id") {
    if (String(projectId) !== String(tableProjectId)) {
        throw (0, httpErrors_1.badRequestError)(`${fieldName}/project_id mismatch`);
    }
}
function ensureScopedResourceEditable(req, resource, tableAuth) {
    return __awaiter(this, void 0, void 0, function* () {
        if (tableAuth) {
            if (resource.project_id) {
                if (String(resource.project_id) !== String(tableAuth.table.project_id)) {
                    throw (0, httpErrors_1.forbiddenError)();
                }
                return;
            }
            if (resource.user_id) {
                if (String(resource.user_id) !== String(tableAuth.table.user_id)) {
                    throw (0, httpErrors_1.forbiddenError)();
                }
                return;
            }
            throw (0, httpErrors_1.forbiddenError)();
        }
        if (resource.project_id) {
            const access = yield (0, authz_1.getProjectAccess)(req, resource.project_id);
            if (!(access === null || access === void 0 ? void 0 : access.isEditor))
                throw (0, httpErrors_1.forbiddenError)();
            return;
        }
        if (resource.user_id) {
            const userId = (0, authz_1.requireUser)(req);
            if (String(resource.user_id) !== String(userId)) {
                throw (0, httpErrors_1.forbiddenError)();
            }
            return;
        }
        throw (0, httpErrors_1.forbiddenError)();
    });
}
