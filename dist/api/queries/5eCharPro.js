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
exports.duplicate5eCharProQuery = exports.edit5eCharProQuery = exports.remove5eCharProQuery = exports.get5eCharProQuery = exports.get5eCharProByGeneralQuery = exports.add5eCharProQuery = void 0;
const dbconfig_1 = require("../dbconfig");
const utils_1 = require("./utils");
function add5eCharProQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."dnd_5e_character_proficiencies" (general_id) values($1) returning *`,
            values: [
                data.general_id,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.add5eCharProQuery = add5eCharProQuery;
function duplicate5eCharProQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const tableName = "dnd_5e_character_proficiencies";
        const columnNames = yield (0, utils_1.columnNamesQuery)(tableName);
        const columnStr = columnNames.join(", ");
        const selectStr = columnNames.map(col => {
            if (col === "general_id")
                return "$2";
            return col;
        }).join(", ");
        const query = {
            text: `
      INSERT INTO public."${tableName}" (${columnStr})
      SELECT ${selectStr}
      FROM ${tableName}
      WHERE general_id = $1
    `,
            values: [
                data.oldGeneralId,
                data.newGeneralId
            ]
        };
        yield dbconfig_1.default.query(query);
    });
}
exports.duplicate5eCharProQuery = duplicate5eCharProQuery;
function get5eCharProQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_proficiencies" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharProQuery = get5eCharProQuery;
function get5eCharProByGeneralQuery(generalId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_proficiencies" where general_id = $1`,
            values: [generalId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharProByGeneralQuery = get5eCharProByGeneralQuery;
function remove5eCharProQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."dnd_5e_character_proficiencies" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.remove5eCharProQuery = remove5eCharProQuery;
function edit5eCharProQuery(id, data) {
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
            text: `update public."dnd_5e_character_proficiencies" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.edit5eCharProQuery = edit5eCharProQuery;
