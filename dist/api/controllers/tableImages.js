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
exports.editTableImage = exports.removeTableImage = exports.addTableImageByProject = exports.addTableImageByUser = exports.getTableImagesByTableProject = exports.getTableImagesByTableUser = void 0;
const tableImages_1 = require("../queries/tableImages");
const tableViews_1 = require("../queries/tableViews");
function addTableImageByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, tableImages_1.addTableImageByProjectQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addTableImageByProject = addTableImageByProject;
function addTableImageByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            req.body.user_id = req.session.user;
            const data = yield (0, tableImages_1.addTableImageByUserQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addTableImageByUser = addTableImageByUser;
function getTableImagesByTableUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableData = yield (0, tableViews_1.getTableViewQuery)(req.params.table_id);
            const data = yield (0, tableImages_1.getTableImagesByUserQuery)(tableData.rows[0].user_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getTableImagesByTableUser = getTableImagesByTableUser;
function getTableImagesByTableProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableData = yield (0, tableViews_1.getTableViewQuery)(req.params.table_id);
            const data = yield (0, tableImages_1.getTableImagesByProjectQuery)(tableData.rows[0].project_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getTableImagesByTableProject = getTableImagesByTableProject;
function removeTableImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, tableImages_1.removeTableImageQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeTableImage = removeTableImage;
function editTableImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, tableImages_1.editTableImageQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editTableImage = editTableImage;
