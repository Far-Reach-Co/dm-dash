const {addClockQuery, getClocksQuery, removeClockQuery, editClockQuery} = require('../queries/clocks.js')

async function addClock(req, res, next) {
  try {
    const data = await addClockQuery(req.body)
    res.status(201).json(data.rows[0])
  } catch(err) {
    next(err)
  }
}

async function getClocks(req, res, next) {
  try {
    const data = await getClocksQuery(req.params.project_id)

    res.send(data.rows)
  } catch(err) {
    next(err)
  }
}

async function removeClock(req, res, next) {
  try {
    const data = await removeClockQuery(req.params.id)
    res.status(204).send()
  } catch(err) {
    next(err)
  }
}

async function editClock(req, res, next) {
  try {
    const data = await editClockQuery(req.params.id, req.body)
    res.status(200).send(data.rows[0])
  } catch(err) {
    next(err)
  }
}

module.exports = {
  getClocks,
  addClock,
  removeClock,
  editClock
}