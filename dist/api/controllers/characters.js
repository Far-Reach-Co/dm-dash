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
exports.editCharacter = exports.removeCharacter = exports.addCharacter = exports.getCharactersByLocation = exports.getCharactersWithKeywordAndFilterQuery = exports.getCharactersWithKeywordQuery = exports.getCharactersWithFilterQuery = exports.getCharacters = exports.getCharacter = void 0;
const characters_js_1 = require("../queries/characters.js");
Object.defineProperty(exports, "getCharactersWithFilterQuery", { enumerable: true, get: function () { return characters_js_1.getCharactersWithFilterQuery; } });
Object.defineProperty(exports, "getCharactersWithKeywordQuery", { enumerable: true, get: function () { return characters_js_1.getCharactersWithKeywordQuery; } });
Object.defineProperty(exports, "getCharactersWithKeywordAndFilterQuery", { enumerable: true, get: function () { return characters_js_1.getCharactersWithKeywordAndFilterQuery; } });
const events_js_1 = require("../queries/events.js");
const images_js_1 = require("../queries/images.js");
const locations_js_1 = require("../queries/locations.js");
const projects_js_1 = require("../queries/projects.js");
const s3_js_1 = require("./s3.js");
function addCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, characters_js_1.addCharacterQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addCharacter = addCharacter;
function getCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const characterData = yield (0, characters_js_1.getCharacterQuery)(req.params.id);
            const character = characterData.rows[0];
            res.send(character);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getCharacter = getCharacter;
function getCharacters(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.params.keyword && req.params.filter) {
            try {
                const data = yield (0, characters_js_1.getCharactersWithKeywordAndFilterQuery)({
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
                const data = yield (0, characters_js_1.getCharactersWithKeywordQuery)({
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
                const data = yield (0, characters_js_1.getCharactersWithFilterQuery)({
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
                const data = yield (0, characters_js_1.getCharactersQuery)({
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
exports.getCharacters = getCharacters;
function getCharactersByLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, characters_js_1.getCharactersByLocationQuery)(req.params.location_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getCharactersByLocation = getCharactersByLocation;
function removeCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const characterData = yield (0, characters_js_1.getCharacterQuery)(req.params.id);
            const character = characterData.rows[0];
            const projectData = yield (0, projects_js_1.getProjectQuery)(character.project_id);
            const project = projectData.rows[0];
            yield (0, characters_js_1.removeCharacterQuery)(req.params.id);
            res.status(204).send();
            if (character.image_id) {
                const imageData = yield (0, images_js_1.getImageQuery)(character.image_id);
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
exports.removeCharacter = removeCharacter;
function editCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const characterData = yield (0, characters_js_1.getCharacterQuery)(req.params.id);
            const character = characterData.rows[0];
            const projectData = yield (0, projects_js_1.getProjectQuery)(character.project_id);
            const project = projectData.rows[0];
            const data = yield (0, characters_js_1.editCharacterQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
            if (req.body.location_id) {
                const locationData = yield (0, locations_js_1.getLocationQuery)(req.body.location_id);
                const location = locationData.rows[0];
                let title = `${character.title} moved to ${location.title}`;
                if (character.location_id) {
                    const previousLocationData = yield (0, locations_js_1.getLocationQuery)(character.location_id);
                    const previousLocation = yield previousLocationData.rows[0];
                    title += ` from ${previousLocation.title}`;
                }
                yield (0, events_js_1.addEventQuery)({
                    project_id: project.id,
                    title,
                    character_id: character.id,
                    location_id: location.id,
                });
            }
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editCharacter = editCharacter;
