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
exports.addMonthQuery = addMonthQuery;
exports.getMonthsQuery = getMonthsQuery;
exports.getMonthQuery = getMonthQuery;
exports.removeMonthQuery = removeMonthQuery;
exports.editMonthQuery = editMonthQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
function addMonthQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Month" (calendar_id, index, title, number_of_days) values($1,$2,$3,$4) returning *`,
            values: [
                data.calendar_id,
                data.index,
                data.title,
                data.number_of_days
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getMonthQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Month" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getMonthsQuery(calendarId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Month" where calendar_id = $1 order by index asc`,
            values: [calendarId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function removeMonthQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Month" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function editMonthQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = (0, utils_1.buildUpdateQuery)("Month", data, id);
        return yield dbconfig_1.default.query(query);
    });
}
