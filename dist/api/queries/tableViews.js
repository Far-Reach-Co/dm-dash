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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTableViewByProjectQuery = addTableViewByProjectQuery;
exports.getTableViewsByProjectQuery = getTableViewsByProjectQuery;
exports.getTableViewByUUIDQuery = getTableViewByUUIDQuery;
exports.getTableViewQuery = getTableViewQuery;
exports.getTableViewsByUserQuery = getTableViewsByUserQuery;
exports.removeTableViewQuery = removeTableViewQuery;
exports.editTableViewQuery = editTableViewQuery;
exports.addTableViewByUserQuery = addTableViewByUserQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
function isMissingModeColumnError(err) {
    var _a;
    if (!err || typeof err !== "object")
        return false;
    const dbErr = err;
    return dbErr.code === "42703" && ((_a = dbErr.message) === null || _a === void 0 ? void 0 : _a.includes(`"mode"`)) === true;
}
function addTableViewByProjectQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."TableView" (project_id, title, mode) values($1,$2,$3) returning *`,
            values: [
                data.project_id,
                data.title,
                data.mode
            ]
        };
        try {
            return yield dbconfig_1.default.query(query);
        }
        catch (err) {
            if (!isMissingModeColumnError(err))
                throw err;
            const fallbackQuery = {
                text: `insert into public."TableView" (project_id, title) values($1,$2) returning *`,
                values: [
                    data.project_id,
                    data.title
                ]
            };
            return yield dbconfig_1.default.query(fallbackQuery);
        }
    });
}
function addTableViewByUserQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."TableView" (user_id, title, mode) values($1,$2,$3) returning *`,
            values: [
                data.user_id,
                data.title,
                data.mode
            ]
        };
        try {
            return yield dbconfig_1.default.query(query);
        }
        catch (err) {
            if (!isMissingModeColumnError(err))
                throw err;
            const fallbackQuery = {
                text: `insert into public."TableView" (user_id, title) values($1,$2) returning *`,
                values: [
                    data.user_id,
                    data.title
                ]
            };
            return yield dbconfig_1.default.query(fallbackQuery);
        }
    });
}
function getTableViewQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableView" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableViewByUUIDQuery(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableView" where uuid = $1`,
            values: [uuid]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableViewsByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableView" where project_id = $1`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableViewsByUserQuery(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableView" where user_id = $1`,
            values: [userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function removeTableViewQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."TableView" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function editTableViewQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = (0, utils_1.buildUpdateQuery)("TableView", data, id);
        try {
            return yield dbconfig_1.default.query(query);
        }
        catch (err) {
            if (!isMissingModeColumnError(err) || typeof data.mode === "undefined") {
                throw err;
            }
            const { mode } = data, fallbackData = __rest(data, ["mode"]);
            if (!Object.keys(fallbackData).length) {
                return yield getTableViewQuery(id);
            }
            const fallbackQuery = (0, utils_1.buildUpdateQuery)("TableView", fallbackData, id);
            return yield dbconfig_1.default.query(fallbackQuery);
        }
    });
}
