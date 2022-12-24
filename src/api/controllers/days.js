const {
  addDayQuery,
  getDaysQuery,
  removeDayQuery,
  editDayQuery,
} = require("../queries/days.js");

async function addDay(req, res, next) {
  try {
    const data = await addDayQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getDays(req, res, next) {
  try {
    const data = await getDaysQuery(req.params.calendar_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeDay(req, res, next) {
  try {
    const data = await removeDayQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editDay(req, res, next) {
  try {
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
