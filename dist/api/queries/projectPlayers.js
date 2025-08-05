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
exports.editProjectPlayerQuery = exports.removeProjectPlayerQuery = exports.getProjectPlayersByPlayerQuery = exports.getProjectPlayersByProjectQuery = exports.getProjectPlayerQuery = exports.addProjectPlayerQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addProjectPlayerQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."ProjectPlayer" (project_id, player_id) values($1,$2) returning *`,
            values: [
                data.project_id,
                data.player_id,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addProjectPlayerQuery = addProjectPlayerQuery;
function getProjectPlayersByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectPlayer" where project_id = $1`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getProjectPlayersByProjectQuery = getProjectPlayersByProjectQuery;
function getProjectPlayersByPlayerQuery(playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectPlayer" where player_id = $1`,
            values: [playerId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getProjectPlayersByPlayerQuery = getProjectPlayersByPlayerQuery;
function getProjectPlayerQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectPlayer" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getProjectPlayerQuery = getProjectPlayerQuery;
function removeProjectPlayerQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."ProjectPlayer" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeProjectPlayerQuery = removeProjectPlayerQuery;
function editProjectPlayerQuery(id, data) {
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
            text: `update public."ProjectPlayer" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editProjectPlayerQuery = editProjectPlayerQuery;
