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
exports.editEventQuery = exports.removeEventQuery = exports.getEventsByLoreQuery = exports.getEventsByItemQuery = exports.getEventsByCharacterQuery = exports.getEventsByLocationQuery = exports.getEventQuery = exports.getEventsQuery = exports.addEventQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addEventQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Event" (title, description, project_id, location_id, character_id, item_id, lore_id) values($1,$2,$3,$4,$5,$6,$7) returning *`,
            values: [
                data.title,
                data.description,
                data.project_id,
                data.location_id,
                data.character_id,
                data.item_id,
                data.lore_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addEventQuery = addEventQuery;
function getEventQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Event" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getEventQuery = getEventQuery;
function getEventsQuery({ projectId, limit, offset }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Event" where project_id = $1 order by date_created desc limit $2 offset $3`,
            values: [projectId, limit, offset]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getEventsQuery = getEventsQuery;
function getEventsByLocationQuery(locationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Event" where location_id = $1 order by date_created desc`,
            values: [locationId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getEventsByLocationQuery = getEventsByLocationQuery;
function getEventsByCharacterQuery(characterId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Event" where character_id = $1 order by date_created desc`,
            values: [characterId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getEventsByCharacterQuery = getEventsByCharacterQuery;
function getEventsByItemQuery(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Event" where item_id = $1 order by date_created desc`,
            values: [itemId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getEventsByItemQuery = getEventsByItemQuery;
function getEventsByLoreQuery(loreId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Event" where lore_id = $1 order by date_created desc`,
            values: [loreId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getEventsByLoreQuery = getEventsByLoreQuery;
function removeEventQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Event" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeEventQuery = removeEventQuery;
function editEventQuery(id, data) {
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
            text: `update public."Event" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editEventQuery = editEventQuery;
