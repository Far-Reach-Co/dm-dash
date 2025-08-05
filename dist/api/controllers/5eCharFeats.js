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
exports.edit5eCharFeat = exports.remove5eCharFeat = exports.add5eCharFeat = exports.get5eCharFeatsByGeneral = void 0;
const _5eCharFeats_1 = require("../queries/5eCharFeats");
function add5eCharFeat(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, _5eCharFeats_1.add5eCharFeatQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.add5eCharFeat = add5eCharFeat;
function get5eCharFeatsByGeneral(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, _5eCharFeats_1.get5eCharFeatsByGeneralQuery)(req.params.general_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.get5eCharFeatsByGeneral = get5eCharFeatsByGeneral;
function remove5eCharFeat(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, _5eCharFeats_1.remove5eCharFeatQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.remove5eCharFeat = remove5eCharFeat;
function edit5eCharFeat(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.body.hasOwnProperty("id")) {
                throw new Error('Request body cannot contain the "id" field');
            }
            if (req.body.hasOwnProperty("general_id")) {
                throw new Error('Request body cannot contain the "general_id" field');
            }
            const data = yield (0, _5eCharFeats_1.edit5eCharFeatQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.edit5eCharFeat = edit5eCharFeat;
