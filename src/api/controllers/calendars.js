const {
  addCalendarQuery,
  getCalendarsQuery,
  getCalendarQuery,
  removeCalendarQuery,
  editCalendarQuery,
} = require("../queries/calendars.js");
const { getMonthsQuery } = require("../queries/months.js");
const { getDaysQuery } = require("../queries/days.js");
const { getProjectQuery } = require("../queries/projects.js");
const {
  getProjectUserByUserAndProjectQuery,
} = require("../queries/projectUsers.js");

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
      if (projectUser.rows && projectUser.rows.length && !projectUser.rows[0].is_editor) throw { status: 403, message: "Forbidden" };
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
      if (projectUser.rows && projectUser.rows.length && !projectUser.rows[0].is_editor) throw { status: 403, message: "Forbidden" };
    }

    const data = await removeCalendarQuery(req.params.id);
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
      if (projectUser.rows && projectUser.rows.length && !projectUser.rows[0].is_editor) throw { status: 403, message: "Forbidden" };
    }

    const data = await editCalendarQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCalendars,
  addCalendar,
  removeCalendar,
  editCalendar,
};
