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
exports.getAllNotesByProjectQuery = exports.editNoteQuery = exports.removeNoteQuery = exports.getNotesByLoreQuery = exports.getNotesByItemQuery = exports.getNotesByCharacterQuery = exports.getNotesByLocationQuery = exports.getNoteQuery = exports.getNotesQuery = exports.addNoteQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addNoteQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Note" (title, description, project_id, location_id, character_id, item_id, user_id, lore_id) values($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
            values: [
                data.title,
                data.description,
                data.project_id,
                data.location_id,
                data.character_id,
                data.item_id,
                data.user_id,
                data.lore_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addNoteQuery = addNoteQuery;
function getNoteQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Note" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getNoteQuery = getNoteQuery;
function getAllNotesByProjectQuery(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Note" where project_id = $1`,
            values: [projectId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getAllNotesByProjectQuery = getAllNotesByProjectQuery;
function getNotesQuery(userId, projectId, limit, offset, keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        let query;
        if (!keyword) {
            query = {
                text: `select * from public."Note" where user_id = $1 and project_id = $2 and location_id is null and character_id is null and item_id is null and lore_id is null order by date_created desc limit $3 offset $4`,
                values: [userId, projectId, limit, offset]
            };
            return yield dbconfig_1.default.query(query);
        }
        query = {
            text: `select * from public."Note" where user_id = $1 and project_id = $2 and position($5 in lower(title))>0 and location_id is null and character_id is null and item_id is null and lore_id is null order by date_created desc limit $3 offset $4`,
            values: [userId, projectId, limit, offset, keyword]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getNotesQuery = getNotesQuery;
function getNotesByLocationQuery(userId, locationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Note" where user_id = $2 and location_id = $1 order by date_created desc`,
            values: [locationId, userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getNotesByLocationQuery = getNotesByLocationQuery;
function getNotesByCharacterQuery(userId, characterId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Note" where user_id = $2 and character_id = $1 order by date_created desc`,
            values: [characterId, userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getNotesByCharacterQuery = getNotesByCharacterQuery;
function getNotesByItemQuery(userId, itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Note" where user_id = $2 and item_id = $1 order by date_created desc`,
            values: [itemId, userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getNotesByItemQuery = getNotesByItemQuery;
function getNotesByLoreQuery(userId, loreId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Note" where user_id = $2 and lore_id = $1 order by date_created desc`,
            values: [loreId, userId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getNotesByLoreQuery = getNotesByLoreQuery;
function removeNoteQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Note" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeNoteQuery = removeNoteQuery;
function editNoteQuery(id, data) {
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
            text: `update public."Note" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editNoteQuery = editNoteQuery;
