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
exports.addImageQuery = addImageQuery;
exports.getImageQuery = getImageQuery;
exports.getImagesQuery = getImagesQuery;
exports.removeImageQuery = removeImageQuery;
exports.editImageQuery = editImageQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
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
function getImageQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Image" where id = $1 and is_blocked = false`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getImagesQuery(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
        const query = {
            text: `SELECT * FROM public."Image" WHERE id IN (${placeholders}) AND is_blocked = false`,
            values: ids,
        };
        return yield dbconfig_1.default.query(query);
    });
}
function removeImageQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Image" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function editImageQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = (0, utils_1.buildUpdateQuery)("Image", data, id);
        return yield dbconfig_1.default.query(query);
    });
}
