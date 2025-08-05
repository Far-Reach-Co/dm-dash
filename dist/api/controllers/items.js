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
exports.editItem = exports.removeItem = exports.addItem = exports.getItemsByCharacter = exports.getItemsByLocation = exports.getItems = exports.getItem = void 0;
const items_js_1 = require("../queries/items.js");
const locations_js_1 = require("../queries/locations.js");
const characters_js_1 = require("../queries/characters.js");
const projects_js_1 = require("../queries/projects.js");
const s3_js_1 = require("./s3.js");
const images_js_1 = require("../queries/images.js");
const events_js_1 = require("../queries/events.js");
function addItem(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, items_js_1.addItemQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addItem = addItem;
function getItem(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const itemData = yield (0, items_js_1.getItemQuery)(req.params.id);
            const item = itemData.rows[0];
            res.send(item);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getItem = getItem;
function getItems(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.params.keyword && req.params.filter) {
            try {
                const data = yield (0, items_js_1.getItemsWithKeywordAndFilterQuery)({
                    projectId: req.params.project_id,
                    limit: req.params.limit,
                    offset: req.params.offset,
                    keyword: req.params.keyword,
                    filter: req.params.filter,
                });
                res.send(data.rows);
            }
            catch (err) {
                next(err);
            }
        }
        else if (req.params.keyword && !req.params.filter) {
            try {
                const data = yield (0, items_js_1.getItemsWithKeywordQuery)({
                    projectId: req.params.project_id,
                    limit: req.params.limit,
                    offset: req.params.offset,
                    keyword: req.params.keyword,
                });
                res.send(data.rows);
            }
            catch (err) {
                next(err);
            }
        }
        else if (req.params.filter && !req.params.keyword) {
            try {
                const data = yield (0, items_js_1.getItemsWithFilterQuery)({
                    projectId: req.params.project_id,
                    limit: req.params.limit,
                    offset: req.params.offset,
                    filter: req.params.filter,
                });
                res.send(data.rows);
            }
            catch (err) {
                next(err);
            }
        }
        else {
            try {
                const data = yield (0, items_js_1.getItemsQuery)({
                    projectId: req.params.project_id,
                    limit: req.params.limit,
                    offset: req.params.offset,
                });
                res.send(data.rows);
            }
            catch (err) {
                next(err);
            }
        }
    });
}
exports.getItems = getItems;
function getItemsByLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, items_js_1.getItemsByLocationQuery)(req.params.location_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getItemsByLocation = getItemsByLocation;
function getItemsByCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, items_js_1.getItemsByCharacterQuery)(req.params.character_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getItemsByCharacter = getItemsByCharacter;
function removeItem(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const itemData = yield (0, items_js_1.getItemQuery)(req.params.id);
            const item = itemData.rows[0];
            const projectData = yield (0, projects_js_1.getProjectQuery)(item.project_id);
            const project = projectData.rows[0];
            const data = yield (0, items_js_1.removeItemQuery)(req.params.id);
            res.status(204).send();
            if (item.image_id) {
                const imageData = yield (0, images_js_1.getImageQuery)(item.image_id);
                const image = imageData.rows[0];
                yield (0, s3_js_1.removeImage)("wyrld/images", image);
                yield (0, images_js_1.removeImageQuery)(image.id);
                const newCalculatedData = project.used_data_in_bytes - image.size;
                yield (0, projects_js_1.editProjectQuery)(project.id, {
                    used_data_in_bytes: newCalculatedData,
                });
            }
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeItem = removeItem;
function editItem(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const itemData = yield (0, items_js_1.getItemQuery)(req.params.id);
            const item = itemData.rows[0];
            const projectData = yield (0, projects_js_1.getProjectQuery)(item.project_id);
            const project = projectData.rows[0];
            const data = yield (0, items_js_1.editItemQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
            if (req.body.location_id) {
                const locationData = yield (0, locations_js_1.getLocationQuery)(req.body.location_id);
                const location = locationData.rows[0];
                let title = `${item.title} moved to ${location.title}`;
                if (item.location_id) {
                    const previousLocationData = yield (0, locations_js_1.getLocationQuery)(item.location_id);
                    const previousLocation = yield previousLocationData.rows[0];
                    title += ` from ${previousLocation.title}`;
                }
                yield (0, events_js_1.addEventQuery)({
                    project_id: project.id,
                    title,
                    item_id: item.id,
                    location_id: location.id,
                });
            }
            if (req.body.character_id) {
                const characterData = yield (0, characters_js_1.getCharacterQuery)(req.body.character_id);
                const character = characterData.rows[0];
                let title = `${item.title} moved to ${character.title}`;
                if (item.character_id) {
                    const previousCharacterData = yield (0, characters_js_1.getCharacterQuery)(item.character_id);
                    const previousCharacter = yield previousCharacterData.rows[0];
                    title += ` from ${previousCharacter.title}`;
                }
                yield (0, events_js_1.addEventQuery)({
                    project_id: project.id,
                    title,
                    item_id: item.id,
                    character_id: character.id,
                });
            }
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editItem = editItem;
