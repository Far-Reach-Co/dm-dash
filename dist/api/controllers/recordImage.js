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
exports.getRecordImagesByRecord = exports.getRecordImagesByImage = exports.removeRecordImageByImage = exports.addRecordImage = exports.getRecordImage = void 0;
const recordImage_1 = require("../queries/recordImage");
function addRecordImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, recordImage_1.addRecordImageQuery)(req.body);
            const recordImage = data.rows[0];
            res.status(201).send(recordImage);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addRecordImage = addRecordImage;
function getRecordImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, recordImage_1.getRecordImageQuery)(req.params.id);
            res.send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getRecordImage = getRecordImage;
function getRecordImagesByRecord(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, recordImage_1.getRecordImagesByRecordQuery)(req.params.record_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getRecordImagesByRecord = getRecordImagesByRecord;
function getRecordImagesByImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, recordImage_1.getRecordImagesByImageQuery)(req.params.image_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getRecordImagesByImage = getRecordImagesByImage;
function removeRecordImageByImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const recordImageData = yield (0, recordImage_1.getRecordImagesByImageQuery)(req.params.image_id);
            const recordImage = recordImageData.rows[0];
            yield (0, recordImage_1.removeRecordImageQuery)(recordImage.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeRecordImageByImage = removeRecordImageByImage;
