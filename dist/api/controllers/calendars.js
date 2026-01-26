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
exports.getCalendars = getCalendars;
exports.getCalendar = getCalendar;
exports.addCalendar = addCalendar;
exports.removeCalendar = removeCalendar;
exports.editCalendar = editCalendar;
const calendars_js_1 = require("../queries/calendars.js");
const months_js_1 = require("../queries/months.js");
const days_js_1 = require("../queries/days.js");
const eventLogger_1 = require("../../lib/eventLogger");
function addCalendar(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, calendars_js_1.addCalendarQuery)(req.body);
            const calendar = data.rows[0];
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                projectId: req.body.project_id,
                eventType: eventLogger_1.EventType.CALENDAR_CREATED,
                eventData: { calendarId: calendar.id, title: calendar.title },
                req,
            });
            res.status(201).json(calendar);
        }
        catch (err) {
            next(err);
        }
    });
}
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
