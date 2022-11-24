const express = require('express')
const {getClocks} = require('./controllers/clocks.js')

var router = express.Router()

// clocks
router.get('/get_clocks', getClocks)

module.exports = router