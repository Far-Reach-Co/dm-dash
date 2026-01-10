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
exports.removeRecord = exports.editRecord = exports.getRecord = exports.getRecordsByProject = exports.getRecordsByUser = exports.addRecordByUser = exports.addRecordByProject = void 0;
const record_1 = require("../queries/record");
const eventLogger_1 = require("../../lib/eventLogger");
function addRecordByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const data = yield (0, record_1.addRecordByUserQuery)({
                user_id: req.session.user,
                title: req.body.title,
                description: req.body.description,
                is_public: req.body.is_public ? true : false,
            });
            const record = data.rows[0];
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                eventType: eventLogger_1.EventType.RECORD_CREATED,
                eventData: { recordId: record.id, title: record.title },
                req,
            });
            res.status(201).send(record);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addRecordByUser = addRecordByUser;
function addRecordByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            if (!req.params.project_id)
                throw new Error("No project ID in params");
            const data = yield (0, record_1.addRecordByProjectQuery)({
                project_id: req.params.project_id,
                title: req.body.title,
                description: req.body.description,
                is_public: req.body.is_public ? true : false,
            });
            const record = data.rows[0];
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                projectId: req.params.project_id,
                eventType: eventLogger_1.EventType.RECORD_CREATED,
                eventData: { recordId: record.id, title: record.title },
                req,
            });
            res.status(201).send(record);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addRecordByProject = addRecordByProject;
function getRecord(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const recordData = yield (0, record_1.getRecordQuery)(req.params.id);
            const record = recordData.rows[0];
            res.send(record);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getRecord = getRecord;
function getRecordsByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const recordData = yield (0, record_1.getRecordsByUserQuery)(req.session.user);
            const records = recordData.rows;
            res.send(records);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getRecordsByUser = getRecordsByUser;
function getRecordsByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const recordData = yield (0, record_1.getRecordsByProjectQuery)(req.params.project_id);
            const records = recordData.rows;
            res.send(records);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getRecordsByProject = getRecordsByProject;
function editRecord(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, record_1.editRecordQuery)(req.params.id, req.body);
            const record = data.rows[0];
            res.status(200).send(record);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editRecord = editRecord;
function removeRecord(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, record_1.removeRecordQuery)(req.params.id);
            res.setHeader("HX-Redirect", "/dash");
            res.send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeRecord = removeRecord;
