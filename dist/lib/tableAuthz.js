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
exports.normalizeTableMode = normalizeTableMode;
exports.parseRequestedTableMode = parseRequestedTableMode;
exports.buildTableCapabilities = buildTableCapabilities;
exports.resolveTableAuth = resolveTableAuth;
exports.requireTablePermission = requireTablePermission;
exports.assertTableCapability = assertTableCapability;
exports.withTableCapabilities = withTableCapabilities;
const authz_1 = require("./authz");
function tableAuthError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}
function normalizeTableMode(mode) {
    if (mode === "sandbox")
        return "sandbox";
    return "standard";
}
function parseRequestedTableMode(mode) {
    return normalizeTableMode(mode);
}
function buildTableCapabilities(mode, canEdit) {
    if (!canEdit) {
        return {
            mode,
            canManagePins: false,
            canUsePinPortals: false,
            canChangeTable: false,
            canManageLayers: false,
            canManageGrid: false,
            canManageImageAssets: false,
            canManageFolders: false,
            canEditImageMetadata: false,
            canDeleteCanvasObjects: false,
            canManageTableSettings: false,
        };
    }
    if (mode === "sandbox") {
        return {
            mode,
            canManagePins: false,
            canUsePinPortals: false,
            canChangeTable: false,
            canManageLayers: true,
            canManageGrid: true,
            canManageImageAssets: false,
            canManageFolders: false,
            canEditImageMetadata: false,
            canDeleteCanvasObjects: false,
            canManageTableSettings: true,
        };
    }
    return {
        mode,
        canManagePins: true,
        canUsePinPortals: true,
        canChangeTable: true,
        canManageLayers: true,
        canManageGrid: true,
        canManageImageAssets: true,
        canManageFolders: true,
        canEditImageMetadata: true,
        canDeleteCanvasObjects: true,
        canManageTableSettings: true,
    };
}
function resolveTableAuth(req, table) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const mode = normalizeTableMode(table.mode);
        if (!table.project_id) {
            if (!table.is_public) {
                const userId = (0, authz_1.requireUser)(req);
                const isOwner = String(table.user_id) === String(userId);
                if (!isOwner)
                    throw tableAuthError(403, "Forbidden");
                const capabilities = buildTableCapabilities(mode, true);
                return {
                    table,
                    mode,
                    canView: true,
                    canEdit: true,
                    isOwner: true,
                    isEditor: true,
                    capabilities,
                };
            }
            const currentUser = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
            const isOwner = typeof currentUser !== "undefined" &&
                String(table.user_id) === String(currentUser);
            const capabilities = buildTableCapabilities(mode, !!isOwner);
            return {
                table,
                mode,
                canView: true,
                canEdit: !!isOwner,
                isOwner: !!isOwner,
                isEditor: !!isOwner,
                capabilities,
            };
        }
        (0, authz_1.requireUser)(req);
        const access = yield (0, authz_1.getProjectAccess)(req, table.project_id);
        if (!access)
            throw tableAuthError(403, "Forbidden");
        const canView = access.isEditor || !!table.is_public;
        if (!canView)
            throw tableAuthError(403, "Forbidden");
        const canEdit = access.isEditor;
        const capabilities = buildTableCapabilities(mode, canEdit);
        return {
            table,
            mode,
            canView,
            canEdit,
            isOwner: access.isOwner,
            isEditor: access.isEditor,
            capabilities,
        };
    });
}
function requireTablePermission(req_1, table_1) {
    return __awaiter(this, arguments, void 0, function* (req, table, mode = "view") {
        const auth = yield resolveTableAuth(req, table);
        if (mode === "edit" && !auth.canEdit) {
            throw tableAuthError(403, "Forbidden");
        }
        return auth;
    });
}
function assertTableCapability(auth, capability, message = "Action is disabled for this table mode") {
    if (!auth.capabilities[capability]) {
        throw tableAuthError(403, message);
    }
}
function withTableCapabilities(table, capabilities) {
    return Object.assign(Object.assign({}, table), { mode: normalizeTableMode(table.mode), capabilities });
}
