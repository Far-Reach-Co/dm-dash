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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTableFolderByProjectQuery = addTableFolderByProjectQuery;
exports.addTableFolderByUserQuery = addTableFolderByUserQuery;
exports.getTableFoldersByProjectQuery = getTableFoldersByProjectQuery;
exports.getTableFoldersByUserQuery = getTableFoldersByUserQuery;
exports.getTableFoldersByParentQuery = getTableFoldersByParentQuery;
exports.getTableFolderQuery = getTableFolderQuery;
exports.removeTableFolderQuery = removeTableFolderQuery;
exports.editTableFolderQuery = editTableFolderQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
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
function getTableFolderQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableFolder" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableFoldersByUserQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableFolder" where user_id = $1 order by id`,
            values: [userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableFoldersByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableFolder" where project_id = $1 order by id`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableFoldersByParentQuery(parentFolderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableFolder" where parent_folder_id = $1 order by id`,
            values: [parentFolderId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function removeTableFolderQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."TableFolder" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function editTableFolderQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = (0, utils_1.buildUpdateQuery)("TableFolder", data, id);
        return yield dbconfig_1.default.query(query);
    });
}
