import {
  addCalendarQuery,
  getCalendarsQuery,
  getCalendarQuery,
  removeCalendarQuery,
  editCalendarQuery,
} from "../queries/calendars.js";

import { getMonthsQuery, removeMonthQuery } from "../queries/months.js";
import { getDaysQuery, removeDayQuery } from "../queries/days.js";
import { getProjectQuery } from "../queries/projects.js";
import { getProjectUserByUserAndProjectQuery } from "../queries/projectUsers.js";

async function addCalendar(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // If user is not author or editor
    const projectData = await getProjectQuery(req.body.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (
        projectUser.rows &&
        projectUser.rows.length &&
        !projectUser.rows[0].is_editor
      )
        throw { status: 403, message: "Forbidden" };
    }

    const data = await addCalendarQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getCalendars(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // If user is not author or editor
    const projectData = await getProjectQuery(req.params.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const calendars = await getCalendarsQuery(req.params.project_id);

    for (const calendar of calendars.rows) {
      const months = await getMonthsQuery(calendar.id);
      calendar.months = months.rows;
    }
    for (const calendar of calendars.rows) {
      const days = await getDaysQuery(calendar.id);
      calendar.days_of_the_week = days.rows;
    }

    res.send(calendars.rows);
  } catch (err) {
    next(err);
  }
}

async function removeCalendar(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get calendar to get project id
    const calendarData = await getCalendarQuery(req.params.id);
    const calendar = calendarData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(calendar.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (
        projectUser.rows &&
        projectUser.rows.length &&
        !projectUser.rows[0].is_editor
      )
        throw { status: 403, message: "Forbidden" };
    }

    await removeCalendarQuery(req.params.id);
    // remove months and days associated
    const monthsData = await getMonthsQuery(req.params.id);
    monthsData.rows.forEach(async (month) => {
      await removeMonthQuery(month.id);
    });
    const daysData = await getDaysQuery(req.params.id);
    daysData.rows.forEach(async (day) => {
      await removeDayQuery(day.id);
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editCalendar(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get calendar to get project id
    const calendarData = await getCalendarQuery(req.params.id);
    const calendar = calendarData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(calendar.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (
        projectUser.rows &&
        projectUser.rows.length &&
        !projectUser.rows[0].is_editor
      )
        throw { status: 403, message: "Forbidden" };
    }

    const data = await editCalendarQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export default {
  getCalendars,
  addCalendar,
  removeCalendar,
  editCalendar,
};
