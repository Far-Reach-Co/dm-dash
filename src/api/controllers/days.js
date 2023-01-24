const {
  addDayQuery,
  getDaysQuery,
  getDayQuery,
  removeDayQuery,
  editDayQuery,
} = require("../queries/days.js");
const { getCalendarQuery } = require("../queries/calendars.js");
const { getProjectQuery } = require("../queries/projects.js");
const {
  getProjectUserByUserAndProjectQuery,
} = require("../queries/projectUsers.js");

async function addDay(req, res, next) {
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
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (projectUser.rows && projectUser.rows.length && !projectUser.rows[0].is_editor) throw { status: 403, message: "Forbidden" };
    }

    const data = await addDayQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getDays(req, res, next) {
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
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await getDaysQuery(req.params.calendar_id);
    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeDay(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get day to get calendar id
    const dayData = await getDayQuery(req.params.id);
    const day = dayData.rows[0];
    // get calendar to get project id
    const calendarData = await getCalendarQuery(day.calendar_id);
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

    await removeDayQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editDay(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get day to get calendar id
    const dayData = await getDayQuery(req.params.id);
    const day = dayData.rows[0];
    // get calendar to get project id
    const calendarData = await getCalendarQuery(day.calendar_id);
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

    const data = await editDayQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDays,
  addDay,
  removeDay,
  editDay,
};
