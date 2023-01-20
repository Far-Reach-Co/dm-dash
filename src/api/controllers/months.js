const {
  addMonthQuery,
  getMonthsQuery,
  getMonthQuery,
  removeMonthQuery,
  editMonthQuery,
} = require("../queries/months.js");
const { getCalendarQuery } = require("../queries/calendars.js");
const { getProjectQuery } = require("../queries/projects.js");
const {
  getProjectUserByUserAndProjectQuery,
} = require("../queries/projectUsers.js");

async function addMonth(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get calendar to get project id
    const calendarData = await getCalendarQuery(req.body.calendar_id);
    const calendar = calendarData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(calendar.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser.is_editor) throw { status: 403, message: "Forbidden" };
    }

    const data = await addMonthQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getMonths(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get calendar to get project id
    const calendarData = await getCalendarQuery(req.params.calendar_id);
    const calendar = calendarData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(calendar.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await getMonthsQuery(req.params.calendar_id);
    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeMonth(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get month to get calendar id
    const monthData = await getMonthQuery(req.params.id);
    const month = monthData.rows[0];
    // get calendar to get project id
    const calendarData = await getCalendarQuery(month.calendar_id);
    const calendar = calendarData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(calendar.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser.is_editor) throw { status: 403, message: "Forbidden" };
    }

    await removeMonthQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editMonth(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get month to get calendar id
    const monthData = await getMonthQuery(req.params.id);
    const month = monthData.rows[0];
    // get calendar to get project id
    const calendarData = await getCalendarQuery(month.calendar_id);
    const calendar = calendarData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(calendar.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser.is_editor) throw { status: 403, message: "Forbidden" };
    }

    const data = await editMonthQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMonths,
  addMonth,
  removeMonth,
  editMonth,
};
