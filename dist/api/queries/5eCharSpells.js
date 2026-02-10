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
exports.add5eCharSpellQuery = add5eCharSpellQuery;
exports.get5eCharSpellsByTypeQuery = get5eCharSpellsByTypeQuery;
exports.get5eCharSpellsByGeneralQuery = get5eCharSpellsByGeneralQuery;
exports.get5eCharSpellQuery = get5eCharSpellQuery;
exports.remove5eCharSpellQuery = remove5eCharSpellQuery;
exports.edit5eCharSpellQuery = edit5eCharSpellQuery;
exports.duplicate5eCharSpellsQuery = duplicate5eCharSpellsQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
const utils_2 = require("./utils");
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
function duplicate5eCharSpellsQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const tableName = "dnd_5e_character_spell";
        const columnNames = yield (0, utils_2.columnNamesQuery)(tableName);
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
function get5eCharSpellQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_spell" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function get5eCharSpellsByTypeQuery(generalId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_spell" where general_id = $1 and type = $2 order by id`,
            values: [generalId, type]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function get5eCharSpellsByGeneralQuery(generalId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_spell" where general_id = $1`,
            values: [generalId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function remove5eCharSpellQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."dnd_5e_character_spell" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function edit5eCharSpellQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = (0, utils_1.buildUpdateQuery)("dnd_5e_character_spell", data, id);
        return yield dbconfig_1.default.query(query);
    });
}
