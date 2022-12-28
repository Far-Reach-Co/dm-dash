const {
  addCounterQuery,
  getCountersQuery,
  removeCounterQuery,
  editCounterQuery,
} = require("../queries/counters.js");

async function addCounter(req, res, next) {
  try {
    const data = await addCounterQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getCounters(req, res, next) {
  try {
    const data = await getCountersQuery(req.params.project_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeCounter(req, res, next) {
  try {
    const data = await removeCounterQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editCounter(req, res, next) {
  try {
    const data = await editCounterQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCounters,
  addCounter,
  removeCounter,
  editCounter,
};