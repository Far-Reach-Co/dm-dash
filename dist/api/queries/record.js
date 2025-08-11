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
exports.editRecordQuery = exports.removeRecordQuery = exports.getRecordQuery = exports.getRecordsByUserQuery = exports.getRecordsByProjectQuery = exports.addRecordByUserQuery = exports.addRecordByProjectQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addRecordByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Record" (project_id) values($1) returning *`,
            values: [
                projectId,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addRecordByProjectQuery = addRecordByProjectQuery;
function addRecordByUserQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Record" (user_id) values($1) returning *`,
            values: [
                userId,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addRecordByUserQuery = addRecordByUserQuery;
function getRecordQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Record" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getRecordQuery = getRecordQuery;
function getRecordsByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Record" where project_id = $1 order by title asc`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getRecordsByProjectQuery = getRecordsByProjectQuery;
function getRecordsByUserQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Record" where user_id = $1 order by title asc`,
            values: [userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getRecordsByUserQuery = getRecordsByUserQuery;
function removeRecordQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Record" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeRecordQuery = removeRecordQuery;
function editRecordQuery(id, data) {
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
            text: `update public."Record" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editRecordQuery = editRecordQuery;
