const {addCalendarQuery, getCalendarsQuery, removeCalendarQuery, editCalendarQuery} = require('../queries/calendars.js')
const {getMonthsQuery} = require('../queries/months.js')

async function addCalendar(req, res, next) {
  try {
    const data = await addCalendarQuery(req.body)
    res.status(201).json(data.rows[0])
  } catch(err) {
    next(err)
  }
}

async function getCalendars(req, res, next) {
  try {
    const calendars = await getCalendarsQuery(req.params.project_id)

    for(const calendar of calendars.rows) {
      const months = await getMonthsQuery(calendar.id)
      calendar.months = months.rows
    }

    res.send(calendars.rows)
  } catch(err) {
    next(err)
  }
}

async function removeCalendar(req, res, next) {
  try {
    const data = await removeCalendarQuery(req.params.id)
    res.status(204).send()
  } catch(err) {
    next(err)
  }
}

async function editCalendar(req, res, next) {
  try {
    const data = await editCalendarQuery(req.params.id, req.body)
    res.status(200).send(data)
  } catch(err) {
    next(err)
  }
}

module.exports = {
  getCalendars,
  addCalendar,
  removeCalendar,
  editCalendar
}