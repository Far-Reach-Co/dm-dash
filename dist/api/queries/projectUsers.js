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
exports.getProjectUserByUserAndProjectQuery = exports.editProjectUserQuery = exports.removeProjectUserQuery = exports.getProjectUsersByProjectQuery = exports.getProjectUsersQuery = exports.getProjectUserQuery = exports.addProjectUserQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addProjectUserQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."ProjectUser" (project_id, user_id, is_editor) values($1,$2,$3) returning *`,
            values: [
                data.project_id,
                data.user_id,
                data.is_editor
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addProjectUserQuery = addProjectUserQuery;
function getProjectUsersQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectUser" where user_id = $1`,
            values: [userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getProjectUsersQuery = getProjectUsersQuery;
function getProjectUserByUserAndProjectQuery(userId, projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectUser" where user_id = $1 and project_id = $2`,
            values: [userId, projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getProjectUserByUserAndProjectQuery = getProjectUserByUserAndProjectQuery;
function getProjectUsersByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectUser" where project_id = $1 order by id`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getProjectUsersByProjectQuery = getProjectUsersByProjectQuery;
function getProjectUserQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectUser" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getProjectUserQuery = getProjectUserQuery;
function removeProjectUserQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."ProjectUser" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeProjectUserQuery = removeProjectUserQuery;
function editProjectUserQuery(id, data) {
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
            text: `update public."ProjectUser" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editProjectUserQuery = editProjectUserQuery;
