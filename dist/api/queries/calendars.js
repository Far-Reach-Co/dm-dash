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
exports.editCalendarQuery = exports.removeCalendarQuery = exports.getCalendarQuery = exports.getCalendarsQuery = exports.addCalendarQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addCalendarQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Calendar" (project_id, title, year) values($1,$2,$3) returning *`,
            values: [
                data.project_id,
                data.title,
                data.year
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addCalendarQuery = addCalendarQuery;
function getCalendarQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Calendar" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getCalendarQuery = getCalendarQuery;
function getCalendarsQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Calendar" where project_id = $1 order by id`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getCalendarsQuery = getCalendarsQuery;
function removeCalendarQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Calendar" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeCalendarQuery = removeCalendarQuery;
function editCalendarQuery(id, data) {
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
            text: `update public."Calendar" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editCalendarQuery = editCalendarQuery;
