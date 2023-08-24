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
exports.editUserPasswordQuery = exports.editUserQuery = exports.registerUserQuery = exports.getUserByEmailQuery = exports.getUserByIdQuery = exports.getAllUsersQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function getUserByIdQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."User" where id = $1`,
            values: [id],
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getUserByIdQuery = getUserByIdQuery;
function getAllUsersQuery() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."User"`,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getAllUsersQuery = getAllUsersQuery;
function getUserByEmailQuery(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."User" where email = $1`,
            values: [email],
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getUserByEmailQuery = getUserByEmailQuery;
function registerUserQuery({ email, username, password }) {
    return __awaiter(this, void 0, void 0, function* () {
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
exports.registerUserQuery = registerUserQuery;
function editUserQuery(id, data) {
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
            text: `update public."User" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editUserQuery = editUserQuery;
function editUserPasswordQuery(id, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `update public."User" set password = $2 where id = $1 returning *`,
            values: [id, password]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editUserPasswordQuery = editUserPasswordQuery;
