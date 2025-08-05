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
exports.edit5eCharSpellQuery = exports.remove5eCharSpellQuery = exports.get5eCharSpellQuery = exports.get5eCharSpellsByGeneralQuery = exports.get5eCharSpellsByTypeQuery = exports.add5eCharSpellQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function add5eCharSpellQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."dnd_5e_character_spell" (general_id, title, description, type) values($1,$2,$3,$4) returning *`,
            values: [
                data.general_id,
                data.title,
                data.description,
                data.type
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.add5eCharSpellQuery = add5eCharSpellQuery;
function get5eCharSpellQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_spell" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharSpellQuery = get5eCharSpellQuery;
function get5eCharSpellsByTypeQuery(generalId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_spell" where general_id = $1 and type = $2 order by id`,
            values: [generalId, type]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharSpellsByTypeQuery = get5eCharSpellsByTypeQuery;
function get5eCharSpellsByGeneralQuery(generalId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_spell" where general_id = $1`,
            values: [generalId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharSpellsByGeneralQuery = get5eCharSpellsByGeneralQuery;
function remove5eCharSpellQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."dnd_5e_character_spell" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.remove5eCharSpellQuery = remove5eCharSpellQuery;
function edit5eCharSpellQuery(id, data) {
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
            text: `update public."dnd_5e_character_spell" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.edit5eCharSpellQuery = edit5eCharSpellQuery;
