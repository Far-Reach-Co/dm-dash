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
exports.removeProjectInviteQuery = exports.getProjectInviteByProjectQuery = exports.getProjectInviteByUUIDQuery = exports.getProjectInviteQuery = exports.addProjectInviteQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addProjectInviteQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."ProjectInvite" (uuid, project_id) values($1,$2) returning *`,
            values: [
                data.uuid,
                data.project_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addProjectInviteQuery = addProjectInviteQuery;
function getProjectInviteQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectInvite" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getProjectInviteQuery = getProjectInviteQuery;
function getProjectInviteByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectInvite" where project_id = $1`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getProjectInviteByProjectQuery = getProjectInviteByProjectQuery;
function getProjectInviteByUUIDQuery(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectInvite" where uuid = $1`,
            values: [uuid]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getProjectInviteByUUIDQuery = getProjectInviteByUUIDQuery;
function removeProjectInviteQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."ProjectInvite" where id = $1 returning *`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeProjectInviteQuery = removeProjectInviteQuery;
