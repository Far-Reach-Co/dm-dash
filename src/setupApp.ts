import { isProd, SECRET_KEY } from "./config";
// Init express and create http server + socket io
import * as express from "express";
import { Request, Response, NextFunction } from "express";
import * as http from "http";
const app = express();
const server = http.createServer(app);

import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as morgan from "morgan";
import * as session from "express-session";
import * as connectPgSimple from "connect-pg-simple";
const pgSession = connectPgSimple(session);

import apiRoutes from "./api/routes.js";
import routes from "./routes.js";
import dndRoutes from "./dnd/routes.js";
import { pool } from "./api/dbconfig.js";

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
      secret: SECRET_KEY || "",
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
      secret: SECRET_KEY || "",
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

export { app, server };
