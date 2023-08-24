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
exports.editMonthQuery = exports.removeMonthQuery = exports.getMonthQuery = exports.getMonthsQuery = exports.addMonthQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addMonthQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Month" (calendar_id, index, title, number_of_days) values($1,$2,$3,$4) returning *`,
            values: [
                data.calendar_id,
                data.index,
                data.title,
                data.number_of_days
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addMonthQuery = addMonthQuery;
function getMonthQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Month" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getMonthQuery = getMonthQuery;
function getMonthsQuery(calendarId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Month" where calendar_id = $1 order by index asc`,
            values: [calendarId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getMonthsQuery = getMonthsQuery;
function removeMonthQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Month" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeMonthQuery = removeMonthQuery;
function editMonthQuery(id, data) {
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
            text: `update public."Month" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editMonthQuery = editMonthQuery;
