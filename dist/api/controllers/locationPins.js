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
exports.getLocationPinsByTableView = getLocationPinsByTableView;
exports.addLocationPin = addLocationPin;
exports.removeLocationPin = removeLocationPin;
exports.updateLocationPin = updateLocationPin;
const locationPins_js_1 = require("../queries/locationPins.js");
const tableViews_js_1 = require("../queries/tableViews.js");
const tableAuthz_1 = require("../../lib/tableAuthz");
function getTableViewById(tableViewId) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield (0, tableViews_js_1.getTableViewQuery)(tableViewId);
        const tableView = data.rows[0];
        if (!tableView) {
            const err = new Error("Table view not found");
            err.status = 404;
            throw err;
        }
        return tableView;
    });
}
function getLocationPinsByTableView(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tableViewId = Number(req.params.table_view_id);
            const tableView = yield getTableViewById(tableViewId);
            yield (0, tableAuthz_1.requireTablePermission)(req, tableView, "view");
            const pins = yield (0, locationPins_js_1.getLocationPinsByTableViewQuery)(tableViewId);
            res.send(pins.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
function addLocationPin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const payload = {
                table_view_id: Number(req.body.table_view_id),
                canvas_object_id: req.body.canvas_object_id,
                title: req.body.title,
                description: (_a = req.body.description) !== null && _a !== void 0 ? _a : "",
                image_id: req.body.image_id ? Number(req.body.image_id) : null,
                portal_table_view_ids: Array.isArray(req.body.portal_table_view_ids)
                    ? req.body.portal_table_view_ids.map(Number).filter(Boolean)
                    : [],
            };
            if (!payload.canvas_object_id) {
                const err = new Error("canvas_object_id is required");
                err.status = 400;
                throw err;
            }
            if (!payload.title) {
                const err = new Error("title is required");
                err.status = 400;
                throw err;
            }
            const tableView = yield getTableViewById(payload.table_view_id);
            const auth = yield (0, tableAuthz_1.requireTablePermission)(req, tableView, "edit");
            (0, tableAuthz_1.assertTableCapability)(auth, "canManagePins");
            const data = yield (0, locationPins_js_1.addLocationPinQuery)(payload);
            res.status(201).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
function removeLocationPin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pinId = Number(req.params.id);
            const pinData = yield (0, locationPins_js_1.getLocationPinByIdQuery)(pinId);
            const pin = pinData.rows[0];
            if (!pin) {
                const err = new Error("Location pin not found");
                err.status = 404;
                throw err;
            }
            const tableView = yield getTableViewById(pin.table_view_id);
            const auth = yield (0, tableAuthz_1.requireTablePermission)(req, tableView, "edit");
            (0, tableAuthz_1.assertTableCapability)(auth, "canManagePins");
            yield (0, locationPins_js_1.removeLocationPinQuery)(pinId);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
function updateLocationPin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pinId = Number(req.params.id);
            const pinData = yield (0, locationPins_js_1.getLocationPinByIdQuery)(pinId);
            const pin = pinData.rows[0];
            if (!pin) {
                const err = new Error("Location pin not found");
                err.status = 404;
                throw err;
            }
            const tableView = yield getTableViewById(pin.table_view_id);
            const auth = yield (0, tableAuthz_1.requireTablePermission)(req, tableView, "edit");
            (0, tableAuthz_1.assertTableCapability)(auth, "canManagePins");
            const payload = {};
            if (typeof req.body.canvas_object_id !== "undefined")
                payload.canvas_object_id = req.body.canvas_object_id;
            if (typeof req.body.title !== "undefined")
                payload.title = req.body.title;
            if (typeof req.body.description !== "undefined")
                payload.description = req.body.description;
            if (typeof req.body.image_id !== "undefined") {
                payload.image_id = req.body.image_id ? Number(req.body.image_id) : null;
            }
            if (Array.isArray(req.body.portal_table_view_ids)) {
                (0, tableAuthz_1.assertTableCapability)(auth, "canUsePinPortals");
                const portalIds = req.body.portal_table_view_ids.map((value) => Number(value));
                payload.portal_table_view_ids = portalIds.filter((id) => !Number.isNaN(id));
            }
            const data = yield (0, locationPins_js_1.updateLocationPinQuery)(pinId, payload);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
