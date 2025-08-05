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
exports.edit5eCharSpellSlotInfoQuery = exports.remove5eCharSpellSlotInfoQuery = exports.get5eCharSpellSlotInfoQuery = exports.get5eCharSpellSlotInfosByGeneralQuery = exports.add5eCharSpellSlotInfoQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function add5eCharSpellSlotInfoQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."dnd_5e_spell_slots" (general_id) values($1) returning *`,
            values: [
                data.general_id,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.add5eCharSpellSlotInfoQuery = add5eCharSpellSlotInfoQuery;
function get5eCharSpellSlotInfoQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_spell_slots" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharSpellSlotInfoQuery = get5eCharSpellSlotInfoQuery;
function get5eCharSpellSlotInfosByGeneralQuery(generalId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_spell_slots" where general_id = $1`,
            values: [generalId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharSpellSlotInfosByGeneralQuery = get5eCharSpellSlotInfosByGeneralQuery;
function remove5eCharSpellSlotInfoQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."dnd_5e_spell_slots" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.remove5eCharSpellSlotInfoQuery = remove5eCharSpellSlotInfoQuery;
function edit5eCharSpellSlotInfoQuery(id, data) {
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
            text: `update public."dnd_5e_spell_slots" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.edit5eCharSpellSlotInfoQuery = edit5eCharSpellSlotInfoQuery;
