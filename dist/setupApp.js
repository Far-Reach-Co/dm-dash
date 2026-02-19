"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionMiddleware = exports.server = exports.app = void 0;
const config_1 = require("./config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = require("redis");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const pino_http_1 = __importDefault(require("pino-http"));
const crypto_1 = require("crypto");
const logger_js_1 = __importDefault(require("./lib/logger.js"));
const redisSessionStore_js_1 = __importDefault(require("./lib/redisSessionStore.js"));
const redisConfig_js_1 = require("./lib/redisConfig.js");
const routes_js_1 = __importDefault(require("./api/routes.js"));
const routes_js_2 = __importDefault(require("./routes.js"));
const routes_js_3 = __importDefault(require("./dnd/routes.js"));
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://www.googletagmanager.com",
                "https://www.google-analytics.com",
                "https://static.cloudflareinsights.com",
            ],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://*.amazonaws.com", "https://*.cloudfront.net", "https://www.dnd5eapi.co"],
            connectSrc: [
                "'self'",
                "https://www.google-analytics.com",
                "https://cloudflareinsights.com",
                "wss://*.farreachco.com",
                "ws://localhost:*",
            ],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: config_1.isProd ? [] : null,
        },
    },
}));
app.use((0, cors_1.default)({
    origin: [
        "https://farreachco.com",
        "https://www.farreachco.com",
        "https://radio.farreachco.com",
        /\.farreachco\.com$/,
    ],
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use((0, pino_http_1.default)({
    logger: logger_js_1.default,
    genReqId: (req) => {
        const headerId = req.headers["x-request-id"];
        if (typeof headerId === "string" && headerId.length > 0) {
            return headerId;
        }
        return (0, crypto_1.randomUUID)();
    },
    customProps: (req) => ({ requestId: req.id }),
}));
app.use((req, res, next) => {
    if (req.id)
        res.setHeader("x-request-id", String(req.id));
    next();
});
app.set("view engine", "ejs");
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(body_parser_1.default.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static("public"));
app.set("trust proxy", 1);
const sessionRedisClient = (0, redis_1.createClient)({ url: (0, redisConfig_js_1.getRedisUrl)() });
sessionRedisClient.on("error", (err) => {
    logger_js_1.default.error({ err }, "Redis session client error");
});
sessionRedisClient.connect().catch((err) => {
    logger_js_1.default.error({ err }, "Failed to connect Redis session client");
});
const redisSessionStore = new redisSessionStore_js_1.default({
    client: sessionRedisClient,
    prefix: "frc:sess:",
    ttlSeconds: 30 * 24 * 60 * 60,
});
const sessionMiddleware = config_1.isProd
    ? (0, express_session_1.default)({
        store: redisSessionStore,
        secret: config_1.SECRET_KEY || "",
        name: "frc_session",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            domain: ".farreachco.com",
            secure: true,
        },
    })
    : (0, express_session_1.default)({
        store: redisSessionStore,
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
    });
exports.sessionMiddleware = sessionMiddleware;
app.use(sessionMiddleware);
app.use("/api", routes_js_1.default);
app.use("/", routes_js_2.default);
app.use("/dnd", routes_js_3.default);
app.use((req, res) => {
    res.status(404).render("404", { auth: req.session.user });
});
app.use((error, req, res, next) => {
    logger_js_1.default.error({ err: error, url: req.url, method: req.method, requestId: req.id }, "Request error");
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
