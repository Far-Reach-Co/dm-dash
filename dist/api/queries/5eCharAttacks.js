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
exports.edit5eCharAttackQuery = exports.remove5eCharAttackQuery = exports.get5eCharAttackQuery = exports.get5eCharAttacksByGeneralQuery = exports.add5eCharAttackQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function add5eCharAttackQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."dnd_5e_character_attack" (general_id, title, description, range, duration, damage_type, bonus) values($1,$2,$3,$4,$5,$6,$7) returning *`,
            values: [
                data.general_id,
                data.title,
                data.description,
                data.range,
                data.duration,
                data.damage_type,
                data.bonus,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.add5eCharAttackQuery = add5eCharAttackQuery;
function get5eCharAttackQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_attack" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharAttackQuery = get5eCharAttackQuery;
function get5eCharAttacksByGeneralQuery(generalId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_attack" where general_id = $1 order by id`,
            values: [generalId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharAttacksByGeneralQuery = get5eCharAttacksByGeneralQuery;
function remove5eCharAttackQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."dnd_5e_character_attack" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.remove5eCharAttackQuery = remove5eCharAttackQuery;
function edit5eCharAttackQuery(id, data) {
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
            text: `update public."dnd_5e_character_attack" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.edit5eCharAttackQuery = edit5eCharAttackQuery;
