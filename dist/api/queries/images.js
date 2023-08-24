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
exports.editImageQuery = exports.removeImageQuery = exports.getImagesQuery = exports.getImageQuery = exports.addImageQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addImageQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Image" (original_name, size, file_name) values($1,$2,$3) returning *`,
            values: [
                data.original_name,
                data.size,
                data.file_name
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addImageQuery = addImageQuery;
function getImageQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Image" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getImageQuery = getImageQuery;
function getImagesQuery(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
        const query = {
            text: `SELECT * FROM public."Image" WHERE id IN (${placeholders})`,
            values: ids,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getImagesQuery = getImagesQuery;
function removeImageQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Image" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeImageQuery = removeImageQuery;
function editImageQuery(id, data) {
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
            text: `update public."Image" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editImageQuery = editImageQuery;
