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
exports.editClockQuery = exports.removeClockQuery = exports.getClockQuery = exports.getClocksQuery = exports.addClockQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addClockQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Clock" (title, current_time_in_milliseconds, project_id) values($1,$2,$3) returning *`,
            values: [
                data.title,
                data.current_time_in_milliseconds,
                data.project_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addClockQuery = addClockQuery;
function getClockQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Clock" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getClockQuery = getClockQuery;
function getClocksQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Clock" where project_id = $1 order by title asc`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getClocksQuery = getClocksQuery;
function removeClockQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Clock" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeClockQuery = removeClockQuery;
function editClockQuery(id, data) {
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
            text: `update public."Clock" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editClockQuery = editClockQuery;
