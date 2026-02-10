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
exports.columnNamesQuery = columnNamesQuery;
exports.buildUpdateQuery = buildUpdateQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
function buildUpdateQuery(tableName, data, id, options) {
    let edits = ``;
    const values = [];
    let iterator = 1;
    const idColumn = (options === null || options === void 0 ? void 0 : options.idColumn) || "id";
    for (const [key, value] of Object.entries(data)) {
        edits += `${key} = $${iterator}, `;
        values.push(value);
        iterator++;
    }
    if (!edits) {
        throw new Error("No fields provided for update");
    }
    edits = edits.slice(0, -2);
    values.push(id);
    return {
        text: `update public."${tableName}" set ${edits} where ${idColumn} = $${iterator} returning *`,
        values,
    };
}
function columnNamesQuery(tableName) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name != 'id'
      ORDER BY ordinal_position
    `,
            values: [tableName],
        };
        const result = yield dbconfig_1.default.query(query);
        return result.rows.map(row => row.column_name);
    });
}
