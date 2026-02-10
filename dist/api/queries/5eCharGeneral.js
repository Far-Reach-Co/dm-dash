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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add5eCharGeneralQuery = add5eCharGeneralQuery;
exports.get5eCharGeneralUserIdQuery = get5eCharGeneralUserIdQuery;
exports.get5eCharsGeneralByUserQuery = get5eCharsGeneralByUserQuery;
exports.get5eCharGeneralQuery = get5eCharGeneralQuery;
exports.remove5eCharGeneralQuery = remove5eCharGeneralQuery;
exports.edit5eCharGeneralQuery = edit5eCharGeneralQuery;
exports.get5eCharNamesQuery = get5eCharNamesQuery;
exports.duplicate5eCharGeneralQuery = duplicate5eCharGeneralQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
const utils_2 = require("./utils");
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
function duplicate5eCharGeneralQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const tableName = "dnd_5e_character_general";
        const columnNames = yield (0, utils_2.columnNamesQuery)(tableName);
        const columnStr = columnNames.join(", ");
        const selectStr = columnNames.map(col => {
            if (col === "name")
                return `${col} || ' (copy)'`;
            return col;
        }).join(", ");
        const query = {
            text: `
      INSERT INTO public."${tableName}" (${columnStr})
      SELECT ${selectStr}
      FROM ${tableName}
      WHERE id = $1
      RETURNING *
    `,
            values: [
                data.generalId
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function get5eCharGeneralQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_general" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function get5eCharGeneralUserIdQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select user_id from public."dnd_5e_character_general" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function get5eCharNamesQuery(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
        const query = {
            text: `SELECT id, name FROM public."dnd_5e_character_general" WHERE id IN (${placeholders})`,
            values: ids,
        };
        return yield dbconfig_1.default.query(query);
    });
}
function get5eCharsGeneralByUserQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_general" where user_id = $1`,
            values: [userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function remove5eCharGeneralQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."dnd_5e_character_general" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function edit5eCharGeneralQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = (0, utils_1.buildUpdateQuery)("dnd_5e_character_general", data, id);
        return yield dbconfig_1.default.query(query);
    });
}
