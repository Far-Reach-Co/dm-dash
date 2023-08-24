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
exports.getLoreRelationsQuery = exports.getLoreRelationsByItemQuery = exports.getLoreRelationsByCharacterQuery = exports.getLoreRelationsByLocationQuery = exports.getLoreRelationsByLoreQuery = exports.editLoreRelationQuery = exports.removeLoreRelationQuery = exports.getLoreRelationQuery = exports.addLoreRelationQuery = void 0;
const dbconfig_1 = require("../dbconfig");
function addLoreRelationQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."LoreRelation" (lore_id, location_id, character_id, item_id) values($1,$2,$3,$4) returning *`,
            values: [
                data.lore_id,
                data.location_id,
                data.character_id,
                data.item_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.addLoreRelationQuery = addLoreRelationQuery;
function getLoreRelationsByLoreQuery(loreId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        if (type === "locations") {
            const query = {
                text: `select * from public."LoreRelation" where lore_id = $1 and location_id is not null`,
                values: [loreId]
            };
            return yield dbconfig_1.default.query(query);
        }
        if (type === "characters") {
            const query = {
                text: `select * from public."LoreRelation" where lore_id = $1 and character_id is not null`,
                values: [loreId]
            };
            return yield dbconfig_1.default.query(query);
        }
        if (type === "items") {
            const query = {
                text: `select * from public."LoreRelation" where lore_id = $1 and item_id is not null`,
                values: [loreId]
            };
            return yield dbconfig_1.default.query(query);
        }
        return [];
    });
}
exports.getLoreRelationsByLoreQuery = getLoreRelationsByLoreQuery;
function getLoreRelationsByLocationQuery(locationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."LoreRelation" where location_id = $1`,
            values: [locationId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLoreRelationsByLocationQuery = getLoreRelationsByLocationQuery;
function getLoreRelationsByCharacterQuery(characterId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."LoreRelation" where character_id = $1`,
            values: [characterId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLoreRelationsByCharacterQuery = getLoreRelationsByCharacterQuery;
function getLoreRelationsByItemQuery(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."LoreRelation" where item_id = $1`,
            values: [itemId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLoreRelationsByItemQuery = getLoreRelationsByItemQuery;
function getLoreRelationQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."LoreRelation" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLoreRelationQuery = getLoreRelationQuery;
function getLoreRelationsQuery(loreId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."LoreRelation" where lore_id = $1`,
            values: [loreId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.getLoreRelationsQuery = getLoreRelationsQuery;
function removeLoreRelationQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."LoreRelation" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.removeLoreRelationQuery = removeLoreRelationQuery;
function editLoreRelationQuery(id, data) {
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
            text: `update public."LoreRelation" set ${edits} where id = $${iterator} returning *`,
            values: values,
        };
        return yield dbconfig_1.default.query(query);
    });
}
exports.editLoreRelationQuery = editLoreRelationQuery;
