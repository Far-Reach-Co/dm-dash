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
exports.edit5eCharOtherProLang = exports.remove5eCharOtherProLang = exports.add5eCharOtherProLang = exports.get5eCharOtherProLangsByGeneral = void 0;
const _5eCharOtherProLang_1 = require("../queries/5eCharOtherProLang");
function add5eCharOtherProLang(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, _5eCharOtherProLang_1.add5eCharOtherProLangQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.add5eCharOtherProLang = add5eCharOtherProLang;
function get5eCharOtherProLangsByGeneral(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, _5eCharOtherProLang_1.get5eCharOtherProLangsByGeneralQuery)(req.params.general_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.get5eCharOtherProLangsByGeneral = get5eCharOtherProLangsByGeneral;
function remove5eCharOtherProLang(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, _5eCharOtherProLang_1.remove5eCharOtherProLangQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.remove5eCharOtherProLang = remove5eCharOtherProLang;
function edit5eCharOtherProLang(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.body.hasOwnProperty("id")) {
                throw new Error('Request body cannot contain the "id" field');
            }
            if (req.body.hasOwnProperty("general_id")) {
                throw new Error('Request body cannot contain the "general_id" field');
            }
            const data = yield (0, _5eCharOtherProLang_1.edit5eCharOtherProLangQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.edit5eCharOtherProLang = edit5eCharOtherProLang;
