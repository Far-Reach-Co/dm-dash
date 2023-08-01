import {
  addCalendarQuery,
  getCalendarsQuery,
  getCalendarQuery,
  removeCalendarQuery,
  editCalendarQuery,
  CalendarModel,
} from "../queries/calendars.js";
import {
  MonthModel,
  getMonthsQuery,
  removeMonthQuery,
} from "../queries/months.js";
import { DayModel, getDaysQuery, removeDayQuery } from "../queries/days.js";
import { Request, Response, NextFunction } from "express";

async function addCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addCalendarQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

interface GetCalendarDataReturnModel extends CalendarModel {
  months: MonthModel[];
  days_of_the_week: DayModel[];
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
    monthsData.rows.forEach(async (month: { id: any }) => {
      await removeMonthQuery(month.id);
    });
    const daysData = await getDaysQuery(req.params.id);
    daysData.rows.forEach(async (day: { id: any }) => {
      await removeDayQuery(day.id);
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editCalendarQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export { getCalendars, getCalendar, addCalendar, removeCalendar, editCalendar };
