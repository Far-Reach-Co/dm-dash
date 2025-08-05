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
exports.editLocationQuery = exports.removeLocationQuery = exports.getSubLocationsQuery = exports.getLocationsWithKeywordAndFilterQuery = exports.getLocationsWithKeywordQuery = exports.getLocationsWithFilterQuery = exports.getLocationsQuery = exports.addLocationQuery = exports.getLocationQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addLocationQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."Location" (project_id, title, description, is_sub, parent_location_id, type, image_id) values($1,$2,$3,$4,$5,$6,$7) returning *`,
            values: [
                data.project_id,
                data.title,
                data.description,
                data.is_sub,
                data.parent_location_id,
                data.type,
                data.image_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addLocationQuery = addLocationQuery;
function getLocationQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Location" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLocationQuery = getLocationQuery;
function getLocationsWithKeywordAndFilterQuery({ projectId, limit, offset, keyword, filter }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Location" where project_id = $1 and position($4 in lower(title))>0 and type = $5 order by title asc limit $2 offset $3`,
            values: [projectId, limit, offset, keyword, filter]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLocationsWithKeywordAndFilterQuery = getLocationsWithKeywordAndFilterQuery;
function getLocationsWithKeywordQuery({ projectId, limit, offset, keyword }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Location" where project_id = $1 and position($4 in lower(title))>0 order by title asc limit $2 offset $3`,
            values: [projectId, limit, offset, keyword]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLocationsWithKeywordQuery = getLocationsWithKeywordQuery;
function getLocationsWithFilterQuery({ projectId, limit, offset, filter }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Location" where project_id = $1 and type = $4 order by title asc limit $2 offset $3`,
            values: [projectId, limit, offset, filter]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLocationsWithFilterQuery = getLocationsWithFilterQuery;
function getLocationsQuery({ projectId, limit, offset }) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Location" where project_id = $1 order by title asc limit $2 offset $3`,
            values: [projectId, limit, offset]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLocationsQuery = getLocationsQuery;
function getSubLocationsQuery(parentLocationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."Location" where parent_location_id = $1 order by title asc`,
            values: [parentLocationId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getSubLocationsQuery = getSubLocationsQuery;
function removeLocationQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."Location" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeLocationQuery = removeLocationQuery;
function editLocationQuery(id, data) {
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
            text: `update public."Location" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editLocationQuery = editLocationQuery;
