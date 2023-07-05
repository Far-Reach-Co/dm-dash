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
const routes = require("./dist/api/routes.js");
const { verifyUserByToken } = require("./dist/api/controllers/users.js");
const {
  userJoin,
  userLeave,
  getCampaignUsers,
} = require("./dist/lib/socketUsers.js");

/***************************** SETUP AND UTILS ***************************/
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

//Set CORS
// app.use(cors())

// fixing "413 Request Entity Too Large" errors
app.use(express.json({ limit: "10mb", extended: true }));
app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);

// Static
app.use(express.static("public"));

// Body Parse
app.use(bodyParser.json());

// MIDDLEWARE
app.use(async (req, res, next) => {
  const pathName = req.url;
  const subApiPath1 = pathName.split("/")[2];

  // check for token
  if (req.headers["x-access-token"]) {
    let token = req.headers["x-access-token"];
    token = token.split(" ")[1];
    // set token or user on request
    if (subApiPath1 === "verify_jwt") {
      req.token = token;
    } else {
      const user = await getUserByToken(token);
      req.user = user;
      if (user) {
        // handle requests that require user
        // TODO: handle security for different groups
        // switch (subApiPath1) {
        //   case "user":
        // }
      } else return res.json({ status: 401, message: "Missing Credentials" });
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
