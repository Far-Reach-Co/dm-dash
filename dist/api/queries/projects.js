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
exports.editProjectQuery = exports.removeProjectQuery = exports.getProjectsQuery = exports.getProjectQuery = exports.addProjectQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addProjectQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Project" (title, user_id) values($1,$2) returning *`,
            values: [
                data.title,
                data.user_id,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addProjectQuery = addProjectQuery;
function getProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Project" where id = $1`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getProjectQuery = getProjectQuery;
function removeProjectQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Project" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeProjectQuery = removeProjectQuery;
function getProjectsQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Project" where user_id = $1 order by id`,
            values: [userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getProjectsQuery = getProjectsQuery;
function editProjectQuery(id, data) {
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
            text: `update public."Project" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editProjectQuery = editProjectQuery;
