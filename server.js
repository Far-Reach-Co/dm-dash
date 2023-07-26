const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const fs = require("fs");
let server = http.createServer(app);
if (process.env.SERVER_ENV === "prod") {
  server = https.createServer(
    {
      key: fs.readFileSync("/etc/letsencrypt/live/farreachco.com/privkey.pem"),
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/farreachco.com/fullchain.pem"
      ),
    },
    app
  );
}
const { Server } = require("socket.io");
const io = new Server(server);
const cors = require("cors");
var path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const apiRoutes = require("./dist/api/routes.js");
const routes = require("./dist/routes.js");
const { verifyUserByToken } = require("./dist/api/controllers/users.js");
const {
  userJoin,
  userLeave,
  getCampaignUsers,
} = require("./dist/lib/socketUsers.js");
const { pool } = require("./dist/api/dbconfig.js");

//Set CORS
// app.use(cors())

// Set view engine to EJS
app.set("view engine", "ejs");

// fixing "413 Request Entity Too Large" errors
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// Static
app.use(express.static("public"));

// MIDDLEWARE
app.use(
  session({
    store: new pgSession({
      pool, // pg pool
      tableName: "session",
    }),
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Routes
app.use("/api", apiRoutes);
app.use("/", routes);

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

/***************************** SOCKETS ***************************/
io.on("connection", (socket) => {
  // testing
  socket.on("campaign-joined", ({ campaign, username }) => {
    try {
      console.log("************** SOCKETTTTTT ***********************\n");
      console.log(campaign, username, "\n");
      console.log("************** SOCKETTTTTT ***********************\n");

      const user = userJoin(socket.id, username, campaign);
      socket.join(campaign);

      // broadcast when a user connects
      io.to(campaign).emit("campaign-join", `Hello ${username}`);

      // send users list
      io.to(user.campaign).emit("current-users", getCampaignUsers(campaign));
    } catch (err) {
      console.log("SOCKET ERROR", err);
    }
  });

  // ************************* VTT *************************

  // grid
  socket.on("grid-changed", ({ campaign, gridState }) => {
    socket.broadcast.to(campaign).emit("grid-change", gridState);
  });
  // update images
  socket.on("image-added", ({ campaign, image }) => {
    socket.broadcast.to(campaign).emit("image-add", image);
  });

  socket.on("image-removed", ({ campaign, id }) => {
    socket.broadcast.to(campaign).emit("image-remove", id);
  });

  socket.on("image-moved", ({ campaign, image }) => {
    socket.broadcast.to(campaign).emit("image-move", image);
  });

  socket.on("object-moved-up", ({ campaign, object }) => {
    socket.broadcast.to(campaign).emit("object-move-up", object);
  });

  socket.on("object-changed-layer", ({ campaign, object }) => {
    socket.broadcast.to(campaign).emit("object-change-layer", object);
  });

  // when a user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      // send users list
      io.to(user.campaign).emit(
        "current-users",
        getCampaignUsers(user.campaign)
      );
    }
  });
});

/***************************** Run ***************************/
let PORT = 4000;
if (process.env.SERVER_ENV === "dev") {
  server.listen({ port: PORT }, async () => {
    console.log(`Server Running at http://localhost:${PORT}`);
  });
} else {
  PORT = 443;
  server.listen({ port: PORT }, async () => {
    console.log(`Server Running at https://localhost:${PORT}`);
  });

  // redirect
  http
    .createServer(function (req, res) {
      res.writeHead(301, {
        Location: "https://" + req.headers["host"] + req.url,
      });
      res.end();
    })
    .listen(80);
}
