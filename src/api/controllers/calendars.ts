import {
  addCalendarQuery,
  getCalendarsQuery,
  getCalendarQuery,
  removeCalendarQuery,
  editCalendarQuery,
  Calendar,
} from "../queries/calendars.js";
import { Month, getMonthsQuery, removeMonthQuery } from "../queries/months.js";
import { Day, getDaysQuery, removeDayQuery } from "../queries/days.js";
import { Request, Response, NextFunction } from "express";
import { logEventAsync, EventType } from "../../lib/eventLogger";

async function addCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addCalendarQuery(req.body);
    const calendar = data.rows[0];
    // Log calendar creation event
    logEventAsync({
      userId: req.session.user,
      projectId: req.body.project_id,
      eventType: EventType.CALENDAR_CREATED,
      eventData: { calendarId: calendar.id, title: calendar.title },
      req,
    });
    res.status(201).json(calendar);
  } catch (err) {
    next(err);
  }
}

interface GetCalendarDataReturnModel extends Calendar {
  months: Month[];
  days_of_the_week: Day[];
}

async function getCalendars(req: Request, res: Response, next: NextFunction) {
  try {
    const calendars = await getCalendarsQuery(req.params.project_id);

    for (const calendar of calendars.rows) {
      const months = await getMonthsQuery(calendar.id);
      (calendar as GetCalendarDataReturnModel).months = months.rows;
    }
    for (const calendar of calendars.rows) {
      const days = await getDaysQuery(calendar.id);
      (calendar as GetCalendarDataReturnModel).days_of_the_week = days.rows;
    }

    res.send(calendars.rows);
  } catch (err) {
    next(err);
  }
}

async function getCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    const calendarData = await getCalendarQuery(req.params.id);
    const calendar = calendarData.rows[0];

    const months = await getMonthsQuery(calendar.id);
    (calendar as GetCalendarDataReturnModel).months = months.rows;

    const days = await getDaysQuery(calendar.id);
    (calendar as GetCalendarDataReturnModel).days_of_the_week = days.rows;

    res.send(calendar);
  } catch (err) {
    next(err);
  }
}

async function removeCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    await removeCalendarQuery(req.params.id);
    // remove months and days associated
    const monthsData = await getMonthsQuery(req.params.id);
    await Promise.all(
      monthsData.rows.map((month: { id: any }) => removeMonthQuery(month.id)),
    );
    const daysData = await getDaysQuery(req.params.id);
    await Promise.all(
      daysData.rows.map((day: { id: any }) => removeDayQuery(day.id)),
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.body.title) {
      delete req.body.title;
    }
    const data = await editCalendarQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export { getCalendars, getCalendar, addCalendar, removeCalendar, editCalendar };
