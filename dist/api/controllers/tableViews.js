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
function addTableViewByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const tableViewsData = yield (0, tableViews_js_1.getTableViewsByProjectQuery)(req.params.project_id);
            if (tableViewsData.rows.length >= 10) {
                const projectData = yield (0, projects_js_1.getProjectQuery)(req.params.project_id);
                if (!projectData.rows[0].is_pro) {
                    throw { status: 402, message: enums_js_1.userSubscriptionStatus.projectIsNotPro };
                }
            }
            const data = yield (0, tableViews_js_1.addTableViewByProjectQuery)({
                title: req.body.title,
                project_id: req.params.project_id,
            });
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                projectId: req.params.project_id,
                eventType: eventLogger_1.EventType.TABLE_CREATED,
                eventData: { tableId: data.rows[0].id, title: req.body.title },
                req,
            });
            res
                .set("HX-Redirect", `/wyrld?id=${req.params.project_id}`)
                .send("Form submission was successful.");
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
            req.body.user_id = req.session.user;
            const data = yield (0, tableViews_js_1.addTableViewByUserQuery)(req.body);
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                eventType: eventLogger_1.EventType.TABLE_CREATED,
                eventData: { tableId: data.rows[0].id, title: req.body.title },
                req,
            });
            res.set("HX-Redirect", `/dash`).send("Form submission was successful.");
        }
        catch (err) {
            next(err);
        }
    });
}
function getTableViewsByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, tableViews_js_1.getTableViewsByProjectQuery)(req.params.project_id);
            res.send(data.rows);
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
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
function getTableView(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableViewData = yield (0, tableViews_js_1.getTableViewQuery)(req.params.id);
            const tableView = tableViewData.rows[0];
            res.send(tableView);
        }
        catch (err) {
            next(err);
        }
    });
}
function getTableViewByUUID(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableViewData = yield (0, tableViews_js_1.getTableViewByUUIDQuery)(req.params.uuid);
            const tableView = tableViewData.rows[0];
            res.send(tableView);
        }
        catch (err) {
            next(err);
        }
    });
}
function removeTableView(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
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
            const data = yield (0, tableViews_js_1.editTableViewQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
