const {addClockQuery, getClocksQuery, removeClockQuery, editClockQuery} = require('../queries/clocks.js')

async function addClock(req, res, next) {
  try {
    const clockData = await addClockQuery(req.body)
    res.status(201).json(clockData.rows[0])
  } catch(err) {
    next(err)
  }
}

async function getClocks(req, res, next) {
  try {
    const clockData = await getClocksQuery()

    res.send(clockData.rows)
  } catch(err) {
    next(err)
  }
}

async function removeClock(req, res, next) {
  try {
    const clockData = await removeClockQuery(req.params.id)
    res.status(204).send()
  } catch(err) {
    next(err)
  }
}

async function editClock(req, res, next) {
  try {
    const clockData = await editClockQuery(req.params.id, req.body)
    res.status(200).send(clockData)
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