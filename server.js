const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
var path = require("path");
const bodyParser = require("body-parser");
const routes = require("./src/api/routes.js");
const { verifyUserByToken } = require("./src/api/controllers/users.js");

async function getUserByToken(token) {
  try {
    const userData = await verifyUserByToken(token);

    if (!userData) return null;

    const data = userData.rows[0];

    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

var app = express();

//Set CORS
// app.use(cors())

// Static
app.use(express.static("public"));

// Body Parse
app.use(bodyParser.json());

// Before
app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
    let token = req.headers["x-access-token"];
    token = token.split(" ")[1];

    if (req.path === "/api/verify_jwt") {
      req.token = token;
    } else {
      const user = await getUserByToken(token);
      if (user) req.user = user;
    }
  }
  next();
});

// Routes
app.use("/api", routes);

//Error
app.use((error, req, res, next) => {
  console.error(error);
  // code for unique constraint on user registration email
  if (error.code == 23505) error.status = 400;
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message || "There was an Error",
    },
  });
});

//Run
var PORT = 80;
app.listen({ port: PORT }, async () => {
  console.log(`Server Running at http://localhost:${PORT}`);
});
