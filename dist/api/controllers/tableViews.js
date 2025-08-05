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
exports.editTableViewTitle = exports.editTableViewData = exports.removeTableView = exports.getTableView = exports.getTableViewByUUID = exports.getTableViewsByProject = exports.getTableViewsByUser = exports.addTableViewByUser = exports.addTableViewByProject = void 0;
const tableViews_js_1 = require("../queries/tableViews.js");
function addTableViewByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            yield (0, tableViews_js_1.addTableViewByProjectQuery)({
                title: req.body.title,
                project_id: req.params.project_id,
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
exports.addTableViewByProject = addTableViewByProject;
function addTableViewByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            req.body.user_id = req.session.user;
            yield (0, tableViews_js_1.addTableViewByUserQuery)(req.body);
            res.set("HX-Redirect", `/dash`).send("Form submission was successful.");
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addTableViewByUser = addTableViewByUser;
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
exports.getTableViewsByProject = getTableViewsByProject;
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
exports.getTableViewsByUser = getTableViewsByUser;
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
exports.getTableView = getTableView;
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
exports.getTableViewByUUID = getTableViewByUUID;
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
exports.removeTableView = removeTableView;
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
exports.editTableViewData = editTableViewData;
function editTableViewTitle(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, tableViews_js_1.editTableViewQuery)(req.params.id, {
                title: req.body.title,
            });
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editTableViewTitle = editTableViewTitle;
