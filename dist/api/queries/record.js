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
exports.addRecordByProjectQuery = addRecordByProjectQuery;
exports.addRecordByUserQuery = addRecordByUserQuery;
exports.getRecordsByProjectQuery = getRecordsByProjectQuery;
exports.getRecordsByUserQuery = getRecordsByUserQuery;
exports.getRecordQuery = getRecordQuery;
exports.removeRecordQuery = removeRecordQuery;
exports.editRecordQuery = editRecordQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
function addRecordByProjectQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Record" (project_id, title, description, is_public) values($1,$2,$3,$4) returning *`,
            values: [
                data.project_id,
                data.title,
                data.description,
                data.is_public
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function addRecordByUserQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Record" (user_id, title, description, is_public) values($1,$2,$3,$4) returning *`,
            values: [
                data.user_id,
                data.title,
                data.description,
                data.is_public
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getRecordQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Record" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getRecordsByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Record" where project_id = $1 order by title asc`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getRecordsByUserQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Record" where user_id = $1 order by title asc`,
            values: [userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function removeRecordQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Record" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
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
