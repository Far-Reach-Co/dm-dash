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
exports.editClock = exports.removeClock = exports.addClock = exports.getClocks = void 0;
const clocks_1 = require("../queries/clocks");
function addClock(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, clocks_1.addClockQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addClock = addClock;
function getClocks(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, clocks_1.getClocksQuery)(req.params.project_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getClocks = getClocks;
function removeClock(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, clocks_1.removeClockQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeClock = removeClock;
function editClock(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, clocks_1.editClockQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editClock = editClock;
