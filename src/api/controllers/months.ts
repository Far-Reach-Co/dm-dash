const {
  addMonthQuery,
  getMonthsQuery,
  getMonthQuery,
  removeMonthQuery,
  editMonthQuery,
} = require("../queries/months.js");

async function addMonth(req, res, next) {
  try {
    const data = await addMonthQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getMonths(req, res, next) {
  try {
    const data = await getMonthsQuery(req.params.calendar_id);
    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeMonth(req, res, next) {
  try {
    await removeMonthQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editMonth(req, res, next) {
  try {
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
