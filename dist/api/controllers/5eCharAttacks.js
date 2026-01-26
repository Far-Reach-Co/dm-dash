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
exports.get5eCharAttacksByGeneral = get5eCharAttacksByGeneral;
exports.add5eCharAttack = add5eCharAttack;
exports.remove5eCharAttack = remove5eCharAttack;
exports.edit5eCharAttack = edit5eCharAttack;
const _5eCharAttacks_1 = require("../queries/5eCharAttacks");
function add5eCharAttack(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, _5eCharAttacks_1.add5eCharAttackQuery)({
                general_id: req.body.general_id,
                title: req.body.title,
            });
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
function get5eCharAttacksByGeneral(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, _5eCharAttacks_1.get5eCharAttacksByGeneralQuery)(req.params.general_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
function remove5eCharAttack(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, _5eCharAttacks_1.remove5eCharAttackQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
function edit5eCharAttack(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.body.hasOwnProperty("id")) {
                throw new Error('Request body cannot contain the "id" field');
            }
            if (req.body.hasOwnProperty("general_id")) {
                throw new Error('Request body cannot contain the "general_id" field');
            }
            const data = yield (0, _5eCharAttacks_1.edit5eCharAttackQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
