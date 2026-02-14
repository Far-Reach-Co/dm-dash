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
exports.getAllUsersQuery = getAllUsersQuery;
exports.getUserByIdQuery = getUserByIdQuery;
exports.getUserByEmailQuery = getUserByEmailQuery;
exports.getUsersByIdsQuery = getUsersByIdsQuery;
exports.getProductUpdateRecipientsQuery = getProductUpdateRecipientsQuery;
exports.registerUserQuery = registerUserQuery;
exports.editUserQuery = editUserQuery;
exports.editUserPasswordQuery = editUserPasswordQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
function getUserByIdQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."User" where id = $1`,
            values: [id],
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getAllUsersQuery() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."User"`,
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getUserByEmailQuery(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."User" where email = $1`,
            values: [email],
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getUsersByIdsQuery(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."User" where id = ANY($1::int[])`,
            values: [ids.map((id) => Number(id))],
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getProductUpdateRecipientsQuery(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const values = [];
        let limitOffsetClause = "";
        if (typeof (opts === null || opts === void 0 ? void 0 : opts.limit) === "number") {
            values.push(opts.limit);
            limitOffsetClause += ` LIMIT $${values.length}`;
        }
        if (typeof (opts === null || opts === void 0 ? void 0 : opts.offset) === "number") {
            values.push(opts.offset);
            limitOffsetClause += ` OFFSET $${values.length}`;
        }
        const query = {
            text: `
      select *
      from public."User"
      where notify_product_updates = true
        and email_unsubscribed_all = false
        and email is not null
        and length(trim(email)) > 0
      order by id
      ${limitOffsetClause}
    `,
            values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
function registerUserQuery(_a) {
    return __awaiter(this, arguments, void 0, function* ({ email, username, password }) {
        const query = {
            text: `insert into public."User" (email, username, password) values($1,$2,$3) RETURNING *`,
            values: [
                email,
                username,
                password
            ],
        };
        return yield dbconfig_1.default.query(query);
    });
}
function editUserQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = (0, utils_1.buildUpdateQuery)("User", data, id);
        return yield dbconfig_1.default.query(query);
    });
}
function editUserPasswordQuery(id, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `update public."User" set password = $2 where id = $1 returning *`,
            values: [id, password]
        };
        return yield dbconfig_1.default.query(query);
    });
}
