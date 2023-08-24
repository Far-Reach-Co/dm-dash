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
exports.editMonth = exports.removeMonth = exports.addMonth = exports.getMonths = void 0;
const months_js_1 = require("../queries/months.js");
function addMonth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, months_js_1.addMonthQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addMonth = addMonth;
function getMonths(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, months_js_1.getMonthsQuery)(req.params.calendar_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getMonths = getMonths;
function removeMonth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, months_js_1.removeMonthQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeMonth = removeMonth;
function editMonth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.body.title) {
                delete req.body.title;
            }
            const data = yield (0, months_js_1.editMonthQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editMonth = editMonth;
