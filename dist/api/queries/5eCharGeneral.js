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
exports.get5eCharNamesQuery = exports.edit5eCharGeneralQuery = exports.remove5eCharGeneralQuery = exports.get5eCharGeneralQuery = exports.get5eCharsGeneralByUserQuery = exports.get5eCharGeneralUserIdQuery = exports.add5eCharGeneralQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function add5eCharGeneralQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."dnd_5e_character_general" (user_id, name) values($1,$2) returning *`,
            values: [
                data.user_id,
                data.name,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.add5eCharGeneralQuery = add5eCharGeneralQuery;
function get5eCharGeneralQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_general" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharGeneralQuery = get5eCharGeneralQuery;
function get5eCharGeneralUserIdQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select user_id from public."dnd_5e_character_general" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharGeneralUserIdQuery = get5eCharGeneralUserIdQuery;
function get5eCharNamesQuery(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
        const query = {
            text: `SELECT name FROM public."dnd_5e_character_general" WHERE id IN (${placeholders})`,
            values: ids,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharNamesQuery = get5eCharNamesQuery;
function get5eCharsGeneralByUserQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_general" where user_id = $1`,
            values: [userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharsGeneralByUserQuery = get5eCharsGeneralByUserQuery;
function remove5eCharGeneralQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."dnd_5e_character_general" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.remove5eCharGeneralQuery = remove5eCharGeneralQuery;
function edit5eCharGeneralQuery(id, data) {
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
            text: `update public."dnd_5e_character_general" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.edit5eCharGeneralQuery = edit5eCharGeneralQuery;
