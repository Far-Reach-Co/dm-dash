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
exports.editCalendar = exports.removeCalendar = exports.addCalendar = exports.getCalendar = exports.getCalendars = void 0;
var calendars_js_1 = require("../queries/calendars.js");
var months_js_1 = require("../queries/months.js");
var days_js_1 = require("../queries/days.js");
function addCalendar(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, calendars_js_1.addCalendarQuery)(req.body)];
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
exports.addCalendar = addCalendar;
function getCalendars(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var calendars, _i, _a, calendar, months, _b, _c, calendar, days, err_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 10, , 11]);
                    return [4, (0, calendars_js_1.getCalendarsQuery)(req.params.project_id)];
                case 1:
                    calendars = _d.sent();
                    _i = 0, _a = calendars.rows;
                    _d.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3, 5];
                    calendar = _a[_i];
                    return [4, (0, months_js_1.getMonthsQuery)(calendar.id)];
                case 3:
                    months = _d.sent();
                    calendar.months = months.rows;
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3, 2];
                case 5:
                    _b = 0, _c = calendars.rows;
                    _d.label = 6;
                case 6:
                    if (!(_b < _c.length)) return [3, 9];
                    calendar = _c[_b];
                    return [4, (0, days_js_1.getDaysQuery)(calendar.id)];
                case 7:
                    days = _d.sent();
                    calendar.days_of_the_week = days.rows;
                    _d.label = 8;
                case 8:
                    _b++;
                    return [3, 6];
                case 9:
                    res.send(calendars.rows);
                    return [3, 11];
                case 10:
                    err_2 = _d.sent();
                    next(err_2);
                    return [3, 11];
                case 11: return [2];
            }
        });
    });
}
exports.getCalendars = getCalendars;
function getCalendar(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var calendarData, calendar, months, days, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4, (0, calendars_js_1.getCalendarQuery)(req.params.id)];
                case 1:
                    calendarData = _a.sent();
                    calendar = calendarData.rows[0];
                    return [4, (0, months_js_1.getMonthsQuery)(calendar.id)];
                case 2:
                    months = _a.sent();
                    calendar.months = months.rows;
                    return [4, (0, days_js_1.getDaysQuery)(calendar.id)];
                case 3:
                    days = _a.sent();
                    calendar.days_of_the_week = days.rows;
                    res.send(calendar);
                    return [3, 5];
                case 4:
                    err_3 = _a.sent();
                    next(err_3);
                    return [3, 5];
                case 5: return [2];
            }
        });
    });
}
exports.getCalendar = getCalendar;
function removeCalendar(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var monthsData, daysData, err_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4, (0, calendars_js_1.removeCalendarQuery)(req.params.id)];
                case 1:
                    _a.sent();
                    return [4, (0, months_js_1.getMonthsQuery)(req.params.id)];
                case 2:
                    monthsData = _a.sent();
                    monthsData.rows.forEach(function (month) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, months_js_1.removeMonthQuery)(month.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, days_js_1.getDaysQuery)(req.params.id)];
                case 3:
                    daysData = _a.sent();
                    daysData.rows.forEach(function (day) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, days_js_1.removeDayQuery)(day.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    res.status(204).send();
                    return [3, 5];
                case 4:
                    err_4 = _a.sent();
                    next(err_4);
                    return [3, 5];
                case 5: return [2];
            }
        });
    });
}
exports.removeCalendar = removeCalendar;
function editCalendar(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, calendars_js_1.editCalendarQuery)(req.params.id, req.body)];
                case 1:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
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
exports.editCalendar = editCalendar;
