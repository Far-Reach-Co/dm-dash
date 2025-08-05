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
exports.getLoreRelationsByItem = exports.getLoreRelationsByCharacter = exports.getLoreRelationsByLocation = exports.getLoreRelationsByLore = exports.getLoreRelation = exports.editLoreRelation = exports.removeLoreRelation = exports.addLoreRelation = void 0;
const { addLoreRelationQuery, getLoreRelationQuery, removeLoreRelationQuery, editLoreRelationQuery, getLoreRelationsByLoreQuery, getLoreRelationsByLocationQuery, getLoreRelationsByCharacterQuery, getLoreRelationsByItemQuery, } = require("../queries/loreRelations.js");
function addLoreRelation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield addLoreRelationQuery(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addLoreRelation = addLoreRelation;
function getLoreRelation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield getLoreRelationQuery(req.params.id);
            res.status(200).json(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getLoreRelation = getLoreRelation;
function getLoreRelationsByLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield getLoreRelationsByLoreQuery(req.params.id, req.params.type);
            res.status(200).json(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getLoreRelationsByLore = getLoreRelationsByLore;
function getLoreRelationsByLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield getLoreRelationsByLocationQuery(req.params.location_id);
            res.status(200).json(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getLoreRelationsByLocation = getLoreRelationsByLocation;
function getLoreRelationsByCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield getLoreRelationsByCharacterQuery(req.params.character_id);
            res.status(200).json(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getLoreRelationsByCharacter = getLoreRelationsByCharacter;
function getLoreRelationsByItem(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield getLoreRelationsByItemQuery(req.params.item_id);
            res.status(200).json(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getLoreRelationsByItem = getLoreRelationsByItem;
function removeLoreRelation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield removeLoreRelationQuery(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeLoreRelation = removeLoreRelation;
function editLoreRelation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield editLoreRelationQuery(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editLoreRelation = editLoreRelation;
