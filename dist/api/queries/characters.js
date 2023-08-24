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
exports.editCharacterQuery = exports.removeCharacterQuery = exports.getCharactersByLocationQuery = exports.getCharactersWithKeywordAndFilterQuery = exports.getCharactersWithKeywordQuery = exports.getCharactersWithFilterQuery = exports.getCharactersQuery = exports.getCharacterQuery = exports.addCharacterQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addCharacterQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Character" (project_id, title, description, type, location_id, image_id) values($1,$2,$3,$4,$5,$6) returning *`,
            values: [
                data.project_id,
                data.title,
                data.description,
                data.type,
                data.location_id,
                data.image_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addCharacterQuery = addCharacterQuery;
function getCharacterQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Character" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getCharacterQuery = getCharacterQuery;
function getCharactersWithKeywordAndFilterQuery({ projectId, limit, offset, keyword, filter }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Character" where project_id = $1 and position($4 in lower(title))>0 and type = $5 order by title asc limit $2 offset $3`,
            values: [projectId, limit, offset, keyword, filter]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getCharactersWithKeywordAndFilterQuery = getCharactersWithKeywordAndFilterQuery;
function getCharactersWithKeywordQuery({ projectId, limit, offset, keyword }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Character" where project_id = $1 and position($4 in lower(title))>0 order by title asc limit $2 offset $3`,
            values: [projectId, limit, offset, keyword]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getCharactersWithKeywordQuery = getCharactersWithKeywordQuery;
function getCharactersWithFilterQuery({ projectId, limit, offset, filter }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Character" where project_id = $1 and type = $4 order by title asc limit $2 offset $3`,
            values: [projectId, limit, offset, filter]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getCharactersWithFilterQuery = getCharactersWithFilterQuery;
function getCharactersQuery({ projectId, limit, offset }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Character" where project_id = $1 order by title asc limit $2 offset $3`,
            values: [projectId, limit, offset]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getCharactersQuery = getCharactersQuery;
function getCharactersByLocationQuery(locationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Character" where location_id = $1 order by title asc`,
            values: [locationId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getCharactersByLocationQuery = getCharactersByLocationQuery;
function removeCharacterQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Character" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeCharacterQuery = removeCharacterQuery;
function editCharacterQuery(id, data) {
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
            text: `update public."Character" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editCharacterQuery = editCharacterQuery;
