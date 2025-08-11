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
exports.removeRecord = exports.editRecord = exports.getRecord = exports.addRecordByUser = exports.addRecordByProject = void 0;
const record_1 = require("../queries/record");
function addRecordByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, record_1.addRecordByUserQuery)(req.body.user_id);
            res.status(201).json(data.rows[0]);
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
            const data = yield (0, record_1.addRecordByProjectQuery)(req.body.project_id);
            res.status(201).json(data.rows[0]);
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
function editRecord(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, record_1.editRecordQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
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
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeRecord = removeRecord;
