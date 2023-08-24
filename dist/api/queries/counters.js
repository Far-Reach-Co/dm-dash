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
exports.editCounterQuery = exports.removeCounterQuery = exports.getAllCountersByProjectQuery = exports.getCounterQuery = exports.getCountersQuery = exports.addCounterQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addCounterQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Counter" (user_id, project_id, current_count, title) values($1,$2,$3,$4) returning *`,
            values: [
                data.user_id,
                data.project_id,
                data.current_count,
                data.title
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addCounterQuery = addCounterQuery;
function getCounterQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Counter" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getCounterQuery = getCounterQuery;
function getCountersQuery(userId, projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Counter" where user_id = $1 and project_id = $2 order by title asc`,
            values: [userId, projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getCountersQuery = getCountersQuery;
function getAllCountersByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Counter" where project_id = $1 order by title asc`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getAllCountersByProjectQuery = getAllCountersByProjectQuery;
function removeCounterQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Counter" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeCounterQuery = removeCounterQuery;
function editCounterQuery(id, data) {
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
            text: `update public."Counter" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editCounterQuery = editCounterQuery;
