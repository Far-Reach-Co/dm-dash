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
exports.addProjectPlayerQuery = addProjectPlayerQuery;
exports.getProjectPlayerQuery = getProjectPlayerQuery;
exports.getProjectPlayersByProjectQuery = getProjectPlayersByProjectQuery;
exports.getProjectPlayersByPlayerQuery = getProjectPlayersByPlayerQuery;
exports.removeProjectPlayerQuery = removeProjectPlayerQuery;
exports.editProjectPlayerQuery = editProjectPlayerQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
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
function getProjectPlayersByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectPlayer" where project_id = $1`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getProjectPlayersByPlayerQuery(playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectPlayer" where player_id = $1`,
            values: [playerId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getProjectPlayerQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."ProjectPlayer" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function removeProjectPlayerQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."ProjectPlayer" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function editProjectPlayerQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = (0, utils_1.buildUpdateQuery)("ProjectPlayer", data, id);
        return yield dbconfig_1.default.query(query);
    });
}
