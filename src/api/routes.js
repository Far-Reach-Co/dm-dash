const express = require('express')
const {getClocks, addClock, removeClock, editClock} = require('./controllers/clocks.js')

var router = express.Router()

// clocks
router.get('/get_clocks', getClocks)
router.post('/add_clock', addClock)
router.delete('/remove_clock/:id', removeClock)
router.put('/edit_clock/:id', editClock)

module.exports = router