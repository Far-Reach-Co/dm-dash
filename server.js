const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const cors = require("cors")
var path = require('path');
const bodyParser = require("body-parser")
const routes = require("./src/api/routes.js")
var public = path.join(__dirname, 'public');

var app = express()

//Set CORS
// app.use(cors())


//Set JSON parser
// app.use(express.json())

// Body Parse
app.use(bodyParser.json());

// Routes
app.use('/api', routes)
// Static 
app.use(express.static('public'))

//Error
app.use((error, req, res, next) => {
  console.error(error)
  // code for unique constraint on user registration email
  if(error.code == 23505) error.status = 400
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message || "Internal Server Error"
    }
  })
})

//Run
var PORT = 80
app.listen({port: PORT}, async () => {
  console.log(`Server Running at http://localhost:${PORT}`)
})