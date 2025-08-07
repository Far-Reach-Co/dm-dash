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
exports.duplicate5eCharClassesQuery = exports.edit5eCharClassQuery = exports.remove5eCharClassQuery = exports.get5eCharClassQuery = exports.get5eCharClassesByGeneralQuery = exports.add5eCharClassQuery = void 0;
const dbconfig_1 = require("../dbconfig");
const utils_1 = require("./utils");
function add5eCharClassQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."dnd_5e_class" (general_id) values($1) returning *`,
            values: [
                data.general_id,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.add5eCharClassQuery = add5eCharClassQuery;
function get5eCharClassQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_class" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharClassQuery = get5eCharClassQuery;
function duplicate5eCharClassesQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const tableName = "dnd_5e_class";
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
exports.duplicate5eCharClassesQuery = duplicate5eCharClassesQuery;
function get5eCharClassesByGeneralQuery(generalId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_class" where general_id = $1 order by id`,
            values: [generalId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.get5eCharClassesByGeneralQuery = get5eCharClassesByGeneralQuery;
function remove5eCharClassQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."dnd_5e_class" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.remove5eCharClassQuery = remove5eCharClassQuery;
function edit5eCharClassQuery(id, data) {
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
            text: `update public."dnd_5e_class" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.edit5eCharClassQuery = edit5eCharClassQuery;
