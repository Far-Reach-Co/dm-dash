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
exports.editLocation = exports.removeLocation = exports.addLocation = exports.getSubLocations = exports.getLocations = exports.getLocation = void 0;
const images_js_1 = require("../queries/images.js");
const locations_js_1 = require("../queries/locations.js");
const projects_js_1 = require("../queries/projects.js");
const s3_js_1 = require("./s3.js");
function addLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, locations_js_1.addLocationQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addLocation = addLocation;
function getLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const locationData = yield (0, locations_js_1.getLocationQuery)(req.params.id);
            const location = locationData.rows[0];
            res.send(location);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getLocation = getLocation;
function getLocations(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.params.keyword && req.params.filter) {
            try {
                const data = yield (0, locations_js_1.getLocationsWithKeywordAndFilterQuery)({
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
                const data = yield (0, locations_js_1.getLocationsWithKeywordQuery)({
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
                const data = yield (0, locations_js_1.getLocationsWithFilterQuery)({
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
                const data = yield (0, locations_js_1.getLocationsQuery)({
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
exports.getLocations = getLocations;
function getSubLocations(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, locations_js_1.getSubLocationsQuery)(req.params.parent_location_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getSubLocations = getSubLocations;
function removeLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const locationData = yield (0, locations_js_1.getLocationQuery)(req.params.id);
            const location = locationData.rows[0];
            const projectData = yield (0, projects_js_1.getProjectQuery)(location.project_id);
            const project = projectData.rows[0];
            const subLocations = yield (0, locations_js_1.getSubLocationsQuery)(req.params.id);
            subLocations.rows.forEach((location) => __awaiter(this, void 0, void 0, function* () {
                yield (0, locations_js_1.editLocationQuery)(location.id, {
                    parent_location_id: null,
                    is_sub: false,
                });
            }));
            yield (0, locations_js_1.removeLocationQuery)(req.params.id);
            res.status(204).send();
            if (location.image_id) {
                const imageData = yield (0, images_js_1.getImageQuery)(location.image_id);
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
exports.removeLocation = removeLocation;
function editLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, locations_js_1.editLocationQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editLocation = editLocation;
