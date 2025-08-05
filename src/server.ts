// Setup Dotenv for Env vars
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

let SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  console.error("Failed to fetch SECRET KEY from ENV VARS");
  process.exit();
}
const isProd = process.env.SERVER_ENV === "prod";

// Init express and create http server + socket io
import * as express from "express";
import { Request, Response, NextFunction } from "express";
import * as http from "http";
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as morgan from "morgan";
import * as session from "express-session";
import * as connectPgSimple from "connect-pg-simple";
const pgSession = connectPgSimple(session);

import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

import apiRoutes from "./api/routes.js";
import routes from "./routes.js";
import dndRoutes from "./dnd/routes.js";
import {
  userJoin,
  userLeave,
  getCurrentUser,
  getTableUsers,
  getChatLog,
  appendMessageToChatLog,
} from "./lib/socketUsers.js";
import { calculateDiceRollResponse } from "./lib/dice.js";
import { pool } from "./api/dbconfig.js";

async function setupRedisAdapter() {
  const pubClient = createClient({ url: "redis://localhost:6379" });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));
}

setupRedisAdapter().catch(console.error);

//Logging
app.use(morgan("combined"));

// Set view engine to EJS
app.set("view engine", "ejs");

// fixing "413 Request Entity Too Large" errors
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// Cookie parser for csrf cookies
app.use(cookieParser());

// Static
app.use(express.static("public"));

// allow first proxy if there is one
app.set("trust proxy", 1);
// sessions

if (isProd) {
  app.use(
    session({
      store: new pgSession({
        pool, // pg pool
        tableName: "session",
      }),
      secret: SECRET_KEY,
      name: "frcsession",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "none",
        domain: ".farreachco.com", // allows all subdomains
        secure: true,
      },
    })
  );
} else {
  app.use(
    session({
      store: new pgSession({
        pool, // pg pool
        tableName: "session",
      }),
      secret: SECRET_KEY,
      name: "frcsession",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "lax",
        secure: false,
      },
    })
  );
}

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
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
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
io.on("connection", (socket: any) => {
  // testing
  socket.on(
    "table-joined",
    async ({ table, username }: { table: string; username: string }) => {
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
    }
  );

  socket.on("get-messages", async ({ table }: { table: string }) => {
    io.to(table).emit("table-messages", await getChatLog(table));
  });

  // grid
  socket.on(
    "grid-toggled",
    ({ table, gridState }: { table: string; gridState: boolean }) => {
      socket.broadcast.to(table).emit("grid-toggle", gridState);
    }
  );

  socket.on(
    "grid-resized",
    ({
      table,
      gridState,
    }: {
      table: string;
      gridState: { width: string | number; height: string | number };
    }) => {
      socket.broadcast.to(table).emit("grid-resize", gridState);
    }
  );
  // table change
  socket.on(
    "table-changed",
    ({ table, newTableUUID }: { table: string; newTableUUID: string }) => {
      socket.broadcast.to(table).emit("table-change", newTableUUID);
    }
  );
  // update images
  socket.on(
    "image-added",
    ({ table, image }: { table: string; image: any }) => {
      socket.broadcast.to(table).emit("image-add", image);
    }
  );

  socket.on(
    "image-removed",
    ({ table, id }: { table: string; id: string | number }) => {
      socket.broadcast.to(table).emit("image-remove", id);
    }
  );

  socket.on(
    "image-moved",
    ({ table, image }: { table: string; image: any }) => {
      socket.broadcast.to(table).emit("image-move", image);
    }
  );

  socket.on(
    "indicator-animation",
    ({
      table,
      x,
      y,
    }: {
      table: string;
      x: string | number;
      y: string | number;
    }) => {
      socket.broadcast.to(table).emit("run-indicator-animation", { x, y });
    }
  );

  // when a user disconnects
  socket.on("disconnect", async () => {
    const user = await userLeave(socket.id);

    if (user) {
      // send users list
      io.to(user.table).emit("current-users", await getTableUsers(user.table));
    }
  });
  // Chat system new message
  socket.on(
    "new-message",
    async ({ table, content }: { table: string; content: string }) => {
      try {
        // Fetch the user details from Redis or your user management system
        const user = await getCurrentUser(socket.id);
        if (!user) {
          console.log(
            "Failure to fetch current user for new message on socket chat system"
          );
          return;
        }

        // Handle special message cases here including / commands:
        if (content.startsWith("/")) {
          const slashCmdArr = content.slice(1).split(" ");
          const [command, ...args] = slashCmdArr;
          switch (command) {
            // Dice rolling message
            case "roll": // Should only take 1 argument
              const diceRes = calculateDiceRollResponse(slashCmdArr[1]);
              content = diceRes;
              break;
            default:
              content = `Unknown command: /${command}`;
          }
        }

        const messageObject = {
          userId: user.id,
          username: user.username,
          content: content,
          timestamp: new Date().toISOString(),
        };

        // Append message to chat log
        await appendMessageToChatLog(table, messageObject);

        io.to(table).emit("message", messageObject);
      } catch (err) {
        console.log("Error handling message event:", err);
      }
    }
  );
});

/***************************** Run ***************************/
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running behind Caddy on http://localhost:${PORT}`);
});
