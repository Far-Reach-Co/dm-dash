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
exports.edit5eCharOtherProLangQuery = exports.remove5eCharOtherProLangQuery = exports.get5eCharOtherProLangQuery = exports.get5eCharOtherProLangsByGeneralQuery = exports.add5eCharOtherProLangQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function add5eCharOtherProLangQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."dnd_5e_character_other_pro_lang" (general_id, type) values($1,$2) returning *`,
            values: [
                data.general_id,
                data.type,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.add5eCharOtherProLangQuery = add5eCharOtherProLangQuery;
function get5eCharOtherProLangQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_other_pro_lang" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharOtherProLangQuery = get5eCharOtherProLangQuery;
function get5eCharOtherProLangsByGeneralQuery(generalId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_other_pro_lang" where general_id = $1 order by id`,
            values: [generalId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharOtherProLangsByGeneralQuery = get5eCharOtherProLangsByGeneralQuery;
function remove5eCharOtherProLangQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."dnd_5e_character_other_pro_lang" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.remove5eCharOtherProLangQuery = remove5eCharOtherProLangQuery;
function edit5eCharOtherProLangQuery(id, data) {
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
            text: `update public."dnd_5e_character_other_pro_lang" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.edit5eCharOtherProLangQuery = edit5eCharOtherProLangQuery;
