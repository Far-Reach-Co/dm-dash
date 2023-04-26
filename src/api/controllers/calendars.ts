const {
  addCalendarQuery,
  getCalendarsQuery,
  getCalendarQuery,
  removeCalendarQuery,
  editCalendarQuery,
} = require("../queries/calendars.js");
const { getMonthsQuery, removeMonthQuery } = require("../queries/months.js");
const { getDaysQuery, removeDayQuery } = require("../queries/days.js");

async function addCalendar(req, res, next) {
  try {
    const data = await addCalendarQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getCalendars(req, res, next) {
  try {
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
