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
// const cors = require("cors");
// var path = require("path");
// const requestIp = require("request-ip");
const bodyParser = require("body-parser");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const redisAdapter = require("socket.io-redis");
io.adapter(redisAdapter({ host: "localhost", port: 6379 }));
const apiRoutes = require("./dist/api/routes.js");
const routes = require("./dist/routes.js");
const dndRoutes = require("./dist/dnd/routes.js");
const {
  userJoin,
  userLeave,
  getCurrentUser,
  getTableUsers,
  getChatLog,
  appendMessageToChatLog,
} = require("./dist/lib/socketUsers.js");
const { pool } = require("./dist/api/dbconfig.js");
const sanitizeHtml = require("sanitize-html");
const { convertURLsToLinks } = require("./dist/lib/utils.js");

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

// check IP, only allow my origins to access /api
// app.use((req, res, next) => {
// if (req.url.includes("/api")) {
//   const clientIp = requestIp.getClientIp(req);
//   console.log("***********************************", clientIp);
//   const authorizedIps = [
//     "::1",
//     "::ffff:127.0.0.1",
//     "::ffff:192.168.100.244",
//     // "::ffff:165.227.88.65",
//     "::ffff:151.19.232.105",
//   ];
//   if (authorizedIps.includes(clientIp)) {
//     next(); // If the IP is in the list, proceed to the next middleware
//   } else {
//     res.status(403).send("Unauthorized IP"); // If the IP is not in the list, reject the request
//   }
// } else next();
// });

// allow first proxy if there is one
app.set("trust proxy", 1);
// sessions
app.use(
  session({
    store: new pgSession({
      pool, // pg pool
      tableName: "session",
    }),
    secret: process.env.SECRET_KEY,
    name: "frcsession",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "lax",
      secure: process.env.SERVER_ENV === "prod" ? true : false,
    },
  })
);

// Routes
// private
app.use("/api", apiRoutes);
// public
app.use("/", routes);
// dnd pages
app.use("/dnd", dndRoutes);
// not found
app.use((req, res) => {
  res.status(404).render("404", { auth: req.session.user });
});

//Error
app.use((error, req, res, next) => {
  console.error(error);
  if (error.code === "EBADCSRFTOKEN") {
    // CSRF token validation failed
    error.status = 403;
    error.message = "Form has expired or was tampered with.";
  }
  // code for unique constraint on user registration email
  if (error.code == 23505) {
    error.status = 400;
    error.message = "This email has already been registered";
  }
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
  socket.on("table-joined", async ({ table, username }) => {
    try {
      const user = await userJoin(socket.id, username, table);
      socket.join(table);

      // broadcast when a user connects
      io.to(table).emit("table-join", `Hello ${username}`);

      // send users list
      io.to(user.table).emit("current-users", await getTableUsers(table));
    } catch (err) {
      console.log("SOCKET ERROR", err);
    }
  });

  socket.on("get-messages", async ({ table }) => {
    io.to(table).emit("table-messages", await getChatLog(table));
  });

  // grid
  socket.on("grid-changed", ({ table, gridState }) => {
    socket.broadcast.to(table).emit("grid-change", gridState);
  });
  // table change
  socket.on("table-changed", ({ table, newTableUUID }) => {
    socket.broadcast.to(table).emit("table-change", newTableUUID);
  });
  // update images
  socket.on("image-added", ({ table, image }) => {
    socket.broadcast.to(table).emit("image-add", image);
  });

  socket.on("image-removed", ({ table, id }) => {
    socket.broadcast.to(table).emit("image-remove", id);
  });

  socket.on("image-moved", ({ table, image }) => {
    socket.broadcast.to(table).emit("image-move", image);
  });

  socket.on("object-moved-up", ({ table, object }) => {
    socket.broadcast.to(table).emit("object-move-up", object);
  });

  socket.on("object-changed-layer", ({ table, object }) => {
    socket.broadcast.to(table).emit("object-change-layer", object);
  });
  // when a user disconnects
  socket.on("disconnect", async () => {
    const user = await userLeave(socket.id);

    if (user) {
      // send users list
      io.to(user.table).emit("current-users", await getTableUsers(user.table));
    }
  });
  // Chat system new message
  socket.on("new-message", async ({ table, content }) => {
    try {
      // Fetch the user details from Redis or your user management system
      const user = await getCurrentUser(socket.id);
      if (!user) {
        console.log(
          "Failure to fetch current user for new message on socket chat system"
        );
        return;
      }

      // first convert any urls to a tags
      const processedContent = convertURLsToLinks(content);
      // remove any unwanted html only allow a tags
      const sanitizedContent = sanitizeHtml(processedContent, {
        allowedTags: ["a"], // Allow only <a> tags
        allowedAttributes: {
          a: ["href", "rel", "target"], // Allow only href, rel, and target attributes on <a> tags
        },
      });

      const messageObject = {
        userId: user.id,
        username: user.username,
        content: sanitizedContent,
        timestamp: new Date().toISOString(),
      };

      // Append message to chat log
      await appendMessageToChatLog(table, messageObject);

      io.to(table).emit("message", messageObject);
    } catch (err) {
      console.log("Error handling message event:", err);
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
