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
exports.editTableImageQuery = exports.removeTableImageQuery = exports.getTableImageQuery = exports.getTableImagesByFolderQuery = exports.getTableImagesByUserQuery = exports.getTableImagesByProjectQuery = exports.addTableImageByUserQuery = exports.addTableImageByProjectQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addTableImageByProjectQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."TableImage" (project_id, image_id, folder_id) values($1,$2,$3) returning *`,
            values: [
                data.project_id,
                data.image_id,
                data.folder_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addTableImageByProjectQuery = addTableImageByProjectQuery;
function addTableImageByUserQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."TableImage" (user_id, image_id, folder_id) values($1,$2,$3) returning *`,
            values: [
                data.user_id,
                data.image_id,
                data.folder_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addTableImageByUserQuery = addTableImageByUserQuery;
function getTableImageQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableImage" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getTableImageQuery = getTableImageQuery;
function getTableImagesByFolderQuery(folder_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableImage" where folder_id = $1`,
            values: [folder_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getTableImagesByFolderQuery = getTableImagesByFolderQuery;
function getTableImagesByProjectQuery(project_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableImage" where project_id = $1`,
            values: [project_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getTableImagesByProjectQuery = getTableImagesByProjectQuery;
function getTableImagesByUserQuery(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableImage" where user_id = $1`,
            values: [user_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getTableImagesByUserQuery = getTableImagesByUserQuery;
function removeTableImageQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."TableImage" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeTableImageQuery = removeTableImageQuery;
function editTableImageQuery(id, data) {
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
            text: `update public."TableImage" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editTableImageQuery = editTableImageQuery;
