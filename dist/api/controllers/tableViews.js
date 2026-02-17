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
exports.addTableViewByProject = addTableViewByProject;
exports.addTableViewByUser = addTableViewByUser;
exports.getTableViewsByUser = getTableViewsByUser;
exports.getTableViewsByProject = getTableViewsByProject;
exports.getTableViewByUUID = getTableViewByUUID;
exports.getTableView = getTableView;
exports.removeTableView = removeTableView;
exports.editTableViewData = editTableViewData;
exports.editTableView = editTableView;
const tableViews_js_1 = require("../queries/tableViews.js");
const enums_js_1 = require("../../lib/enums.js");
const users_js_1 = require("../queries/users.js");
const projects_js_1 = require("../queries/projects.js");
const eventLogger_1 = require("../../lib/eventLogger");
const tableAuthz_1 = require("../../lib/tableAuthz");
const authz_1 = require("../../lib/authz");
const tableResourceUtils_1 = require("./tableResourceUtils");
function getTitle(value) {
    if (typeof value === "string" && value.trim())
        return value.trim();
    return "New Campaign";
}
function parseIsPublic(value) {
    if (typeof value === "boolean")
        return value;
    if (value === "on" || value === "true")
        return true;
    if (value === "off" || value === "false")
        return false;
    return null;
}
function sanitizeTablePatch(body) {
    const payload = {};
    if (typeof body.title === "string" && body.title.trim()) {
        payload.title = body.title.trim();
    }
    const isPublic = parseIsPublic(body.is_public);
    if (isPublic !== null)
        payload.is_public = isPublic;
    if (typeof body.mode !== "undefined") {
        payload.mode = (0, tableAuthz_1.parseRequestedTableMode)(body.mode);
    }
    return payload;
}
function addTableViewByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            yield (0, authz_1.requireProjectEditor)(req, req.params.project_id);
            const tableViewsData = yield (0, tableViews_js_1.getTableViewsByProjectQuery)(req.params.project_id);
            if (tableViewsData.rows.length >= 10) {
                const projectData = yield (0, projects_js_1.getProjectQuery)(req.params.project_id);
                if (!projectData.rows[0].is_pro) {
                    throw { status: 402, message: enums_js_1.userSubscriptionStatus.projectIsNotPro };
                }
            }
            const title = getTitle(req.body.title);
            const mode = (0, tableAuthz_1.parseRequestedTableMode)(req.body.mode);
            const data = yield (0, tableViews_js_1.addTableViewByProjectQuery)({
                title,
                project_id: req.params.project_id,
                mode,
            });
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                projectId: req.params.project_id,
                eventType: eventLogger_1.EventType.TABLE_CREATED,
                eventData: { tableId: data.rows[0].id, title },
                req,
            });
            res.status(201).json({ redirect: `/vtt?uuid=${data.rows[0].uuid}` });
        }
        catch (err) {
            next(err);
        }
    });
}
function addTableViewByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const tableViewsData = yield (0, tableViews_js_1.getTableViewsByUserQuery)(req.session.user);
            if (tableViewsData.rows.length >= 10) {
                const userData = yield (0, users_js_1.getUserByIdQuery)(req.session.user);
                if (!userData.rows[0].is_pro) {
                    throw { status: 402, message: enums_js_1.userSubscriptionStatus.userIsNotPro };
                }
            }
            const title = getTitle(req.body.title);
            const mode = (0, tableAuthz_1.parseRequestedTableMode)(req.body.mode);
            const data = yield (0, tableViews_js_1.addTableViewByUserQuery)({
                user_id: req.session.user,
                title,
                mode,
            });
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                eventType: eventLogger_1.EventType.TABLE_CREATED,
                eventData: { tableId: data.rows[0].id, title },
                req,
            });
            res.status(201).json({ redirect: `/vtt?uuid=${data.rows[0].uuid}` });
        }
        catch (err) {
            next(err);
        }
    });
}
function getTableViewsByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const access = yield (0, authz_1.getProjectAccess)(req, req.params.project_id);
            if (!access) {
                throw (0, tableResourceUtils_1.forbiddenError)();
            }
            const data = yield (0, tableViews_js_1.getTableViewsByProjectQuery)(req.params.project_id);
            const tableRows = access.isEditor
                ? data.rows
                : data.rows.filter((row) => row.is_public);
            const response = tableRows.map((row) => (0, tableAuthz_1.withTableCapabilities)(row, (0, tableAuthz_1.buildTableCapabilities)((0, tableAuthz_1.normalizeTableMode)(row.mode), access.isEditor)));
            res.send(response);
        }
        catch (err) {
            next(err);
        }
    });
}
function getTableViewsByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const data = yield (0, tableViews_js_1.getTableViewsByUserQuery)(req.session.user);
            const response = data.rows.map((row) => (0, tableAuthz_1.withTableCapabilities)(row, (0, tableAuthz_1.buildTableCapabilities)((0, tableAuthz_1.normalizeTableMode)(row.mode), true)));
            res.send(response);
        }
        catch (err) {
            next(err);
        }
    });
}
function getTableView(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { table: tableView, auth } = yield (0, tableResourceUtils_1.requireTablePermissionById)(req, req.params.id, "view");
            res.send((0, tableAuthz_1.withTableCapabilities)(tableView, auth.capabilities));
        }
        catch (err) {
            next(err);
        }
    });
}
function getTableViewByUUID(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableView = yield (0, tableResourceUtils_1.getTableViewByUUIDOrThrow)(req.params.uuid);
            const auth = yield (0, tableAuthz_1.requireTablePermission)(req, tableView, "view");
            res.send((0, tableAuthz_1.withTableCapabilities)(tableView, auth.capabilities));
        }
        catch (err) {
            next(err);
        }
    });
}
function removeTableView(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, tableResourceUtils_1.requireTablePermissionById)(req, req.params.id, "edit");
            yield (0, tableViews_js_1.removeTableViewQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
function editTableViewData(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { auth } = yield (0, tableResourceUtils_1.requireTablePermissionById)(req, req.params.id, "view");
            (0, tableAuthz_1.assertTableCapability)(auth, "canEditTableData");
            const data = yield (0, tableViews_js_1.editTableViewQuery)(req.params.id, {
                data: req.body.data,
            });
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
function editTableView(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { table: tableView, auth } = yield (0, tableResourceUtils_1.requireTablePermissionById)(req, req.params.id, "edit");
            const payload = sanitizeTablePatch(req.body);
            if (!Object.keys(payload).length) {
                res.status(200).send((0, tableAuthz_1.withTableCapabilities)(tableView, auth.capabilities));
                return;
            }
            const data = yield (0, tableViews_js_1.editTableViewQuery)(req.params.id, payload);
            const updatedMode = (0, tableAuthz_1.normalizeTableMode)(data.rows[0].mode);
            const updatedCapabilities = (0, tableAuthz_1.buildTableCapabilities)(updatedMode, auth.canEdit);
            res.status(200).send((0, tableAuthz_1.withTableCapabilities)(data.rows[0], updatedCapabilities));
        }
        catch (err) {
            next(err);
        }
    });
}
