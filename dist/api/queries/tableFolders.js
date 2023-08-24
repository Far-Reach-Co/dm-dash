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
exports.editTableFolderQuery = exports.removeTableFolderQuery = exports.getTableFolderQuery = exports.getTableFoldersByParentQuery = exports.getTableFoldersByUserQuery = exports.getTableFoldersByProjectQuery = exports.addTableFolderByUserQuery = exports.addTableFolderByProjectQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addTableFolderByProjectQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."TableFolder" (project_id, title, is_sub, parent_folder_id) values($1,$2,$3,$4) returning *`,
            values: [
                data.project_id,
                data.title,
                data.is_sub,
                data.parent_folder_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addTableFolderByProjectQuery = addTableFolderByProjectQuery;
function addTableFolderByUserQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."TableFolder" (user_id, title, is_sub, parent_folder_id) values($1,$2,$3,$4) returning *`,
            values: [
                data.user_id,
                data.title,
                data.is_sub,
                data.parent_folder_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addTableFolderByUserQuery = addTableFolderByUserQuery;
function getTableFolderQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableFolder" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getTableFolderQuery = getTableFolderQuery;
function getTableFoldersByUserQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableFolder" where user_id = $1 order by id`,
            values: [userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getTableFoldersByUserQuery = getTableFoldersByUserQuery;
function getTableFoldersByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableFolder" where project_id = $1 order by id`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getTableFoldersByProjectQuery = getTableFoldersByProjectQuery;
function getTableFoldersByParentQuery(parentFolderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableFolder" where parent_folder_id = $1 order by id`,
            values: [parentFolderId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getTableFoldersByParentQuery = getTableFoldersByParentQuery;
function removeTableFolderQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."TableFolder" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeTableFolderQuery = removeTableFolderQuery;
function editTableFolderQuery(id, data) {
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
            text: `update public."TableFolder" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editTableFolderQuery = editTableFolderQuery;
