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
exports.edit5eCharFeatQuery = exports.remove5eCharFeatQuery = exports.get5eCharFeatQuery = exports.get5eCharFeatsByGeneralQuery = exports.add5eCharFeatQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function add5eCharFeatQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."dnd_5e_character_feat_trait" (general_id, title, description, type) values($1,$2,$3,$4) returning *`,
            values: [
                data.general_id,
                data.title,
                data.description,
                data.type,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.add5eCharFeatQuery = add5eCharFeatQuery;
function get5eCharFeatQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_feat_trait" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharFeatQuery = get5eCharFeatQuery;
function get5eCharFeatsByGeneralQuery(generalId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_feat_trait" where general_id = $1 order by id`,
            values: [generalId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharFeatsByGeneralQuery = get5eCharFeatsByGeneralQuery;
function remove5eCharFeatQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."dnd_5e_character_feat_trait" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.remove5eCharFeatQuery = remove5eCharFeatQuery;
function edit5eCharFeatQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let edits = ``;
        let values = [];
        let iterator = 1;
        for (const [key, value] of Object.entries(data)) {
            edits += `${key} = $${iterator}, `;
            values.push(value);
            iterator++;
        }
        edits = edits.slice(0, -2);
        values.push(id);
        const query = {
            text: `update public."dnd_5e_character_feat_trait" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.edit5eCharFeatQuery = edit5eCharFeatQuery;
