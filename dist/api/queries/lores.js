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
exports.editLoreQuery = exports.removeLoreQuery = exports.getLoresWithKeywordAndFilterQuery = exports.getLoresWithKeywordQuery = exports.getLoresWithFilterQuery = exports.getLoreQuery = exports.getLoresQuery = exports.addLoreQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addLoreQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Lore" (project_id, title, description, type, image_id) values($1,$2,$3,$4,$5) returning *`,
            values: [
                data.project_id,
                data.title,
                data.description,
                data.type,
                data.image_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addLoreQuery = addLoreQuery;
function getLoreQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Lore" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLoreQuery = getLoreQuery;
function getLoresWithKeywordAndFilterQuery({ projectId, limit, offset, keyword, filter }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Lore" where project_id = $1 and position($4 in lower(title))>0 and type = $5 order by title asc limit $2 offset $3`,
            values: [projectId, limit, offset, keyword, filter]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLoresWithKeywordAndFilterQuery = getLoresWithKeywordAndFilterQuery;
function getLoresWithKeywordQuery({ projectId, limit, offset, keyword }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Lore" where project_id = $1 and position($4 in lower(title))>0 order by title asc limit $2 offset $3`,
            values: [projectId, limit, offset, keyword]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLoresWithKeywordQuery = getLoresWithKeywordQuery;
function getLoresWithFilterQuery({ projectId, limit, offset, filter }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Lore" where project_id = $1 and type = $4 order by title asc limit $2 offset $3`,
            values: [projectId, limit, offset, filter]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLoresWithFilterQuery = getLoresWithFilterQuery;
function getLoresQuery({ projectId, limit, offset }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Lore" where project_id = $1 order by title asc limit $2 offset $3`,
            values: [projectId, limit, offset]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLoresQuery = getLoresQuery;
function removeLoreQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Lore" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeLoreQuery = removeLoreQuery;
function editLoreQuery(id, data) {
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
            text: `update public."Lore" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editLoreQuery = editLoreQuery;
