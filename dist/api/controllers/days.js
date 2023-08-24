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
exports.editDay = exports.removeDay = exports.addDay = exports.getDays = void 0;
const days_1 = require("../queries/days");
function addDay(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, days_1.addDayQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addDay = addDay;
function getDays(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, days_1.getDaysQuery)(req.params.calendar_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getDays = getDays;
function removeDay(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, days_1.removeDayQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeDay = removeDay;
function editDay(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.body.title) {
                delete req.body.title;
            }
            const data = yield (0, days_1.editDayQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editDay = editDay;
