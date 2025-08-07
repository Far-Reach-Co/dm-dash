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
exports.columnNamesQuery = void 0;
const dbconfig_1 = require("../dbconfig");
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
exports.columnNamesQuery = columnNamesQuery;
