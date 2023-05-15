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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getEventsByLore = exports.getEventsByItem = exports.getEventsByCharacter = exports.editEvent = exports.removeEvent = exports.addEvent = exports.getEventsByLocation = exports.getEvents = void 0;
var events_1 = require("../queries/events");
function addEvent(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, events_1.addEventQuery)(req.body)];
                case 1:
                    data = _a.sent();
                    res.status(201).json(data.rows[0]);
                    return [3, 3];
                case 2:
                    err_1 = _a.sent();
                    next(err_1);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.addEvent = addEvent;
function getEvents(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, events_1.getEventsQuery)({
                            projectId: req.params.project_id,
                            limit: req.params.limit,
                            offset: req.params.offset
                        })];
                case 1:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 3];
                case 2:
                    err_2 = _a.sent();
                    next(err_2);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.getEvents = getEvents;
function getEventsByLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, events_1.getEventsByLocationQuery)(req.params.location_id)];
                case 1:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 3];
                case 2:
                    err_3 = _a.sent();
                    next(err_3);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.getEventsByLocation = getEventsByLocation;
function getEventsByCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, events_1.getEventsByCharacterQuery)(req.params.character_id)];
                case 1:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 3];
                case 2:
                    err_4 = _a.sent();
                    next(err_4);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.getEventsByCharacter = getEventsByCharacter;
function getEventsByItem(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, events_1.getEventsByItemQuery)(req.params.item_id)];
                case 1:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 3];
                case 2:
                    err_5 = _a.sent();
                    next(err_5);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.getEventsByItem = getEventsByItem;
function getEventsByLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, events_1.getEventsByLoreQuery)(req.params.lore_id)];
                case 1:
                    data = _a.sent();
                    res.send(data.rows);
                    return [3, 3];
                case 2:
                    err_6 = _a.sent();
                    next(err_6);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.getEventsByLore = getEventsByLore;
function removeEvent(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, events_1.removeEventQuery)(req.params.id)];
                case 1:
                    _a.sent();
                    res.status(204).send();
                    return [3, 3];
                case 2:
                    err_7 = _a.sent();
                    next(err_7);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.removeEvent = removeEvent;
function editEvent(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, events_1.editEventQuery)(req.params.id, req.body)];
                case 1:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
                    return [3, 3];
                case 2:
                    err_8 = _a.sent();
                    next(err_8);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.editEvent = editEvent;
