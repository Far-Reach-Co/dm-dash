"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const config_1 = require("./config");
const express = require("express");
const http = require("http");
const app = express();
exports.app = app;
const server = http.createServer(app);
exports.server = server;
const { Server } = require("socket.io");
const io = new Server(server);
exports.io = io;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const session = require("express-session");
const connectPgSimple = require("connect-pg-simple");
const pgSession = connectPgSimple(session);
const routes_js_1 = require("./api/routes.js");
const routes_js_2 = require("./routes.js");
const routes_js_3 = require("./dnd/routes.js");
const dbconfig_js_1 = require("./api/dbconfig.js");
app.use(morgan("combined"));
app.set("view engine", "ejs");
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000,
}));
app.use(cookieParser());
app.use(express.static("public"));
app.set("trust proxy", 1);
if (config_1.isProd) {
    app.use(session({
        store: new pgSession({
            pool: dbconfig_js_1.pool,
            tableName: "session",
        }),
        secret: config_1.SECRET_KEY || "",
        name: "frcsession",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            domain: ".farreachco.com",
            secure: true,
        },
    }));
}
else {
    app.use(session({
        store: new pgSession({
            pool: dbconfig_js_1.pool,
            tableName: "session",
        }),
        secret: config_1.SECRET_KEY || "",
        name: "frcsession",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
            secure: false,
        },
    }));
}
app.use("/api", routes_js_1.default);
app.use("/", routes_js_2.default);
app.use("/dnd", routes_js_3.default);
app.use((req, res) => {
    res.status(404).render("404", { auth: req.session.user });
});
app.use((error, req, res, next) => {
    console.error(error);
    if (error.code === "EBADCSRFTOKEN") {
        error.status = 403;
        error.message = "Form has expired or was tampered with.";
    }
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
