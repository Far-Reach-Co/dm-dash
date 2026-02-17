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
exports.requireUser = requireUser;
exports.requireUserOrRedirect = requireUserOrRedirect;
exports.requireProjectOwnerOrRedirect = requireProjectOwnerOrRedirect;
exports.requireProjectEditorOrRedirect = requireProjectEditorOrRedirect;
exports.requireProjectMemberOrRedirect = requireProjectMemberOrRedirect;
exports.requireProjectOwner = requireProjectOwner;
exports.requireProjectEditor = requireProjectEditor;
exports.getProjectUserForViewer = getProjectUserForViewer;
exports.getProjectAccess = getProjectAccess;
exports.requireTableAccessOrRedirect = requireTableAccessOrRedirect;
exports.requireRecordAccessOrRedirect = requireRecordAccessOrRedirect;
const projects_1 = require("../api/queries/projects");
const projectUsers_1 = require("../api/queries/projectUsers");
function requireUser(req) {
    var _a;
    if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.user))
        throw new Error("User is not logged in");
    return req.session.user;
}
function requireUserOrRedirect(req, res, redirectTo) {
    var _a;
    if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.user)) {
        res.redirect(redirectTo);
        return null;
    }
    return req.session.user;
}
function getProjectOrThrow(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectData = yield (0, projects_1.getProjectQuery)(projectId);
        const project = projectData.rows[0];
        if (!project)
            throw new Error("Project not found");
        return project;
    });
}
function isProjectOwner(project, userId) {
    return String(project.user_id) === String(userId);
}
function getProjectUser(userId, projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(userId, projectId);
        return projectUserData.rows[0] || null;
    });
}
function requireProjectOwnerOrRedirect(req_1, res_1, projectId_1) {
    return __awaiter(this, arguments, void 0, function* (req, res, projectId, redirectTo = "/forbidden") {
        const userId = requireUserOrRedirect(req, res, redirectTo);
        if (!userId)
            return null;
        try {
            const project = yield getProjectOrThrow(projectId);
            if (!isProjectOwner(project, userId)) {
                res.redirect(redirectTo);
                return null;
            }
            return project;
        }
        catch (_a) {
            res.redirect(redirectTo);
            return null;
        }
    });
}
function requireProjectEditorOrRedirect(req_1, res_1, projectId_1) {
    return __awaiter(this, arguments, void 0, function* (req, res, projectId, redirectTo = "/forbidden") {
        const userId = requireUserOrRedirect(req, res, redirectTo);
        if (!userId)
            return null;
        try {
            const project = yield getProjectOrThrow(projectId);
            if (isProjectOwner(project, userId))
                return project;
            const projectUser = yield getProjectUser(userId, projectId);
            if (!projectUser || !projectUser.is_editor) {
                res.redirect(redirectTo);
                return null;
            }
            return project;
        }
        catch (_a) {
            res.redirect(redirectTo);
            return null;
        }
    });
}
function requireProjectMemberOrRedirect(req_1, res_1, projectId_1) {
    return __awaiter(this, arguments, void 0, function* (req, res, projectId, redirectTo = "/forbidden") {
        const userId = requireUserOrRedirect(req, res, redirectTo);
        if (!userId)
            return null;
        try {
            const project = yield getProjectOrThrow(projectId);
            if (isProjectOwner(project, userId))
                return project;
            const projectUser = yield getProjectUser(userId, projectId);
            if (!projectUser) {
                res.redirect(redirectTo);
                return null;
            }
            return project;
        }
        catch (_a) {
            res.redirect(redirectTo);
            return null;
        }
    });
}
function requireProjectOwner(req, projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = requireUser(req);
        const project = yield getProjectOrThrow(projectId);
        if (!isProjectOwner(project, userId)) {
            throw new Error("User is not owner");
        }
        return project;
    });
}
function requireProjectEditor(req, projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = requireUser(req);
        const project = yield getProjectOrThrow(projectId);
        if (isProjectOwner(project, userId))
            return project;
        const projectUser = yield getProjectUser(userId, projectId);
        if (!projectUser || !projectUser.is_editor) {
            throw new Error("User is not authorized");
        }
        return project;
    });
}
function getProjectUserForViewer(req, projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = requireUser(req);
        const project = yield getProjectOrThrow(projectId);
        if (isProjectOwner(project, userId)) {
            return { project, isOwner: true, isEditor: true };
        }
        const projectUser = yield getProjectUser(userId, projectId);
        if (!projectUser)
            return null;
        return { project, isOwner: false, isEditor: !!projectUser.is_editor };
    });
}
function getProjectAccess(req, projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = requireUser(req);
        const project = yield getProjectOrThrow(projectId);
        if (isProjectOwner(project, userId)) {
            return {
                project,
                isOwner: true,
                isEditor: true,
                isMember: true,
                projectUserId: null,
            };
        }
        const projectUser = yield getProjectUser(userId, projectId);
        if (!projectUser)
            return null;
        return {
            project,
            isOwner: false,
            isEditor: !!projectUser.is_editor,
            isMember: true,
            projectUserId: projectUser.id,
        };
    });
}
function requireTableAccessOrRedirect(req_1, res_1, table_1) {
    return __awaiter(this, arguments, void 0, function* (req, res, table, redirectTo = "/forbidden") {
        if (!table.project_id) {
            if (table.is_public)
                return { projectAuth: false };
            const userId = requireUserOrRedirect(req, res, redirectTo);
            if (!userId)
                return null;
            if (String(table.user_id) === String(userId))
                return { projectAuth: false };
            res.redirect(redirectTo);
            return null;
        }
        const userId = requireUserOrRedirect(req, res, redirectTo);
        if (!userId)
            return null;
        const access = yield getProjectAccess(req, table.project_id);
        if (!access) {
            res.redirect(redirectTo);
            return null;
        }
        if (!table.is_public && !access.isEditor) {
            res.redirect(redirectTo);
            return null;
        }
        return { projectAuth: access.isEditor };
    });
}
function requireRecordAccessOrRedirect(req, res, record, options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const redirectTo = options.redirectTo || "/forbidden";
        const projectId = (_a = options.projectId) !== null && _a !== void 0 ? _a : null;
        if (!projectId) {
            if (options.mode === "view" && record.is_public && !((_b = req.session) === null || _b === void 0 ? void 0 : _b.user)) {
                return { canEdit: false, projectId: null };
            }
            const userId = requireUserOrRedirect(req, res, redirectTo);
            if (!userId)
                return null;
            const isOwner = String(record.user_id) === String(userId);
            if (options.mode === "edit" && !isOwner) {
                res.redirect(redirectTo);
                return null;
            }
            if (!record.is_public && !isOwner) {
                res.redirect(redirectTo);
                return null;
            }
            return { canEdit: isOwner, projectId: null };
        }
        const userId = requireUserOrRedirect(req, res, redirectTo);
        if (!userId)
            return null;
        const access = yield getProjectAccess(req, projectId);
        if (!access) {
            res.redirect(redirectTo);
            return null;
        }
        if (options.mode === "edit") {
            if (!access.isEditor) {
                res.redirect(redirectTo);
                return null;
            }
            return { canEdit: true, projectId };
        }
        if (!access.isEditor && !record.is_public) {
            res.redirect(redirectTo);
            return null;
        }
        return { canEdit: access.isEditor, projectId };
    });
}
