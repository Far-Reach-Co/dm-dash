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
exports.editCalendar = exports.removeCalendar = exports.addCalendar = exports.getCalendar = exports.getCalendars = void 0;
const calendars_js_1 = require("../queries/calendars.js");
const months_js_1 = require("../queries/months.js");
const days_js_1 = require("../queries/days.js");
function addCalendar(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, calendars_js_1.addCalendarQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addCalendar = addCalendar;
function getCalendars(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const calendars = yield (0, calendars_js_1.getCalendarsQuery)(req.params.project_id);
            for (const calendar of calendars.rows) {
                const months = yield (0, months_js_1.getMonthsQuery)(calendar.id);
                calendar.months = months.rows;
            }
            for (const calendar of calendars.rows) {
                const days = yield (0, days_js_1.getDaysQuery)(calendar.id);
                calendar.days_of_the_week = days.rows;
            }
            res.send(calendars.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getCalendars = getCalendars;
function getCalendar(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const calendarData = yield (0, calendars_js_1.getCalendarQuery)(req.params.id);
            const calendar = calendarData.rows[0];
            const months = yield (0, months_js_1.getMonthsQuery)(calendar.id);
            calendar.months = months.rows;
            const days = yield (0, days_js_1.getDaysQuery)(calendar.id);
            calendar.days_of_the_week = days.rows;
            res.send(calendar);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getCalendar = getCalendar;
function removeCalendar(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, calendars_js_1.removeCalendarQuery)(req.params.id);
            const monthsData = yield (0, months_js_1.getMonthsQuery)(req.params.id);
            monthsData.rows.forEach((month) => __awaiter(this, void 0, void 0, function* () {
                yield (0, months_js_1.removeMonthQuery)(month.id);
            }));
            const daysData = yield (0, days_js_1.getDaysQuery)(req.params.id);
            daysData.rows.forEach((day) => __awaiter(this, void 0, void 0, function* () {
                yield (0, days_js_1.removeDayQuery)(day.id);
            }));
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeCalendar = removeCalendar;
function editCalendar(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.body.title) {
                delete req.body.title;
            }
            const data = yield (0, calendars_js_1.editCalendarQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editCalendar = editCalendar;
