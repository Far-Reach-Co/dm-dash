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
exports.getEventsByLore = exports.getEventsByItem = exports.getEventsByCharacter = exports.editEvent = exports.removeEvent = exports.addEvent = exports.getEventsByLocation = exports.getEvents = void 0;
const events_1 = require("../queries/events");
function addEvent(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, events_1.addEventQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addEvent = addEvent;
function getEvents(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, events_1.getEventsQuery)({
                projectId: req.params.project_id,
                limit: req.params.limit,
                offset: req.params.offset,
            });
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getEvents = getEvents;
function getEventsByLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, events_1.getEventsByLocationQuery)(req.params.location_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getEventsByLocation = getEventsByLocation;
function getEventsByCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, events_1.getEventsByCharacterQuery)(req.params.character_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getEventsByCharacter = getEventsByCharacter;
function getEventsByItem(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, events_1.getEventsByItemQuery)(req.params.item_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getEventsByItem = getEventsByItem;
function getEventsByLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, events_1.getEventsByLoreQuery)(req.params.lore_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getEventsByLore = getEventsByLore;
function removeEvent(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, events_1.removeEventQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeEvent = removeEvent;
function editEvent(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, events_1.editEventQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editEvent = editEvent;
