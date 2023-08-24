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
exports.addTableViewByUserQuery = exports.editTableViewQuery = exports.removeTableViewQuery = exports.getTableViewsByUserQuery = exports.getTableViewQuery = exports.getTableViewByUUIDQuery = exports.getTableViewsByProjectQuery = exports.addTableViewByProjectQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addTableViewByProjectQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."TableView" (project_id, title) values($1,$2) returning *`,
            values: [
                data.project_id,
                data.title
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addTableViewByProjectQuery = addTableViewByProjectQuery;
function addTableViewByUserQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."TableView" (user_id, title) values($1,$2) returning *`,
            values: [
                data.user_id,
                data.title
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addTableViewByUserQuery = addTableViewByUserQuery;
function getTableViewQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableView" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getTableViewQuery = getTableViewQuery;
function getTableViewByUUIDQuery(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableView" where uuid = $1`,
            values: [uuid]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getTableViewByUUIDQuery = getTableViewByUUIDQuery;
function getTableViewsByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableView" where project_id = $1`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getTableViewsByProjectQuery = getTableViewsByProjectQuery;
function getTableViewsByUserQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableView" where user_id = $1`,
            values: [userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getTableViewsByUserQuery = getTableViewsByUserQuery;
function removeTableViewQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."TableView" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeTableViewQuery = removeTableViewQuery;
function editTableViewQuery(id, data) {
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
            text: `update public."TableView" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editTableViewQuery = editTableViewQuery;
