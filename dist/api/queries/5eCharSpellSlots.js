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
exports.add5eCharSpellSlotInfoQuery = add5eCharSpellSlotInfoQuery;
exports.get5eCharSpellSlotInfosByGeneralQuery = get5eCharSpellSlotInfosByGeneralQuery;
exports.get5eCharSpellSlotInfoQuery = get5eCharSpellSlotInfoQuery;
exports.remove5eCharSpellSlotInfoQuery = remove5eCharSpellSlotInfoQuery;
exports.edit5eCharSpellSlotInfoQuery = edit5eCharSpellSlotInfoQuery;
exports.duplicate5eCharSpellSlotsQuery = duplicate5eCharSpellSlotsQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
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
function duplicate5eCharSpellSlotsQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const tableName = "dnd_5e_spell_slots";
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
function get5eCharSpellSlotInfoQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_spell_slots" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function get5eCharSpellSlotInfosByGeneralQuery(generalId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_spell_slots" where general_id = $1`,
            values: [generalId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function remove5eCharSpellSlotInfoQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."dnd_5e_spell_slots" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
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
