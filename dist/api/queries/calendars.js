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
exports.addCalendarQuery = addCalendarQuery;
exports.getCalendarsQuery = getCalendarsQuery;
exports.getCalendarQuery = getCalendarQuery;
exports.removeCalendarQuery = removeCalendarQuery;
exports.editCalendarQuery = editCalendarQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
function addCalendarQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Calendar" (project_id, title, year) values($1,$2,$3) returning *`,
            values: [
                data.project_id,
                data.title,
                data.year
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getCalendarQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Calendar" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getCalendarsQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Calendar" where project_id = $1 order by id`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function removeCalendarQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Calendar" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function editCalendarQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = (0, utils_1.buildUpdateQuery)("Calendar", data, id);
        return yield dbconfig_1.default.query(query);
    });
}
