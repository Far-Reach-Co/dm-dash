import { isProd, SECRET_KEY } from "./config";
// Init express and create http server + socket io
import express, { Request, Response, NextFunction } from "express";
import http from "http";
const app = express();
const server = http.createServer(app);

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import { createClient } from "redis";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import logger from "./lib/logger.js";
import RedisSessionStore from "./lib/redisSessionStore.js";

import apiRoutes from "./api/routes.js";
import routes from "./routes.js";
import dndRoutes from "./dnd/routes.js";

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // for inline scripts - ideally migrate to nonces later
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          "https://static.cloudflareinsights.com",
        ],
        scriptSrcAttr: ["'unsafe-inline'"], // for onclick handlers - ideally remove these later
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
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
  })
);

// CORS - allow specific origins
app.use(
  cors({
    origin: [
      "https://farreachco.com",
      "https://www.farreachco.com",
      "https://radio.farreachco.com",
      /\.farreachco\.com$/,
    ],
    credentials: true,
  })
);

// Compression
app.use(compression());

// Structured request logging
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => {
      const headerId = req.headers["x-request-id"];
      if (typeof headerId === "string" && headerId.length > 0) {
        return headerId;
      }
      return randomUUID();
    },
    customProps: (req) => ({ requestId: req.id }),
  }),
);
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.id) res.setHeader("x-request-id", String(req.id));
  next();
});

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
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const sessionRedisClient = createClient({ url: redisUrl });
sessionRedisClient.on("error", (err) => {
  logger.error({ err }, "Redis session client error");
});
sessionRedisClient.connect().catch((err) => {
  logger.error({ err }, "Failed to connect Redis session client");
});

const redisSessionStore = new RedisSessionStore({
  client: sessionRedisClient,
  prefix: "frc:sess:",
  ttlSeconds: 30 * 24 * 60 * 60,
});

if (isProd) {
  app.use(
    session({
      store: redisSessionStore,
      secret: SECRET_KEY || "",
      name: "frc_session",
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
      store: redisSessionStore,
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
app.use((req: Request, res: Response) => {
  res.status(404).render("404", { auth: req.session.user });
});

//Error
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(
    { err: error, url: req.url, method: req.method, requestId: req.id },
    "Request error",
  );
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
